import assert from 'node:assert';
import { describe, it } from 'node:test';

import { comunidadServiceFactory, normalizeCelular, parseCompanias, sanitizeCedula } from '#services/comunidad.service';

// Base del colegio simulada: responde según la consulta que se ejecute
const fakeDb = ({ empleados = {}, estudiantes = {}, familias = {} } = {}) => async(sql, params = {}) => {
  if (sql.includes('OPENQUERY')) {
    const nit = /f200_nit = ''([^']*)''/.exec(sql)?.[1];
    return empleados[nit] ? [empleados[nit]] : [];
  }
  if (sql.includes('FROM students')) return estudiantes[params.nit] ? [estudiantes[params.nit]] : [];
  if (sql.includes('FROM family_info')) {
    const fila = Object.values(familias).find((f) => f.father_id === params.nit || f.mother_id === params.nit);
    return fila ? [fila] : [];
  }
  return [];
};

const makeService = (db, configured = true) => comunidadServiceFactory({
  runQuery: fakeDb(db),
  isConfigured: () => configured
});

const DB = {
  empleados: { 71000111: { f200_nit: '71000111', f200_nombres: 'CARLOS', f200_apellido1: 'RUIZ', f200_apellido2: 'MEJIA' } },
  estudiantes: { 1011222333: { first_name: 'Ana', middle_name: null, last_name: 'Gómez Pérez', family_id: 4521 } },
  familias: {
    f1: { father: 'Luis', father_last_name: 'Gómez', father_id: '43222111', father_cell_phone: '3001112233', mother: 'Marta', mother_last_name: 'Pérez', mother_id: '43999888', mother_cell_phone: '+57 310 444 5566', employee: 0, id_family: 4521 },
    f2: { father: 'Carlos', father_last_name: 'Ruiz', father_id: '71000111', mother: null, mother_last_name: null, mother_id: null, employee: 1, id_family: 7788 }
  }
};

describe('Service: comunidadService', () => {
  it('sanitizeCedula should strip quotes and symbols (the value goes inside OPENQUERY)', () => {
    assert.strictEqual(sanitizeCedula("123'; DROP--"), '123DROP--');
    assert.strictEqual(sanitizeCedula(' 1.017.234 '), '1017234');
  });

  it('parseCompanias should accept only numeric company ids (they go inside OPENQUERY)', () => {
    assert.deepStrictEqual(parseCompanias('1,3'), ['1', '3']);
    assert.deepStrictEqual(parseCompanias(undefined), ['1']);
    assert.deepStrictEqual(parseCompanias("1; DROP TABLE x"), ['1']);
    assert.deepStrictEqual(parseCompanias("3'') --"), ['1']);
  });

  it('should search employees only in the configured companies', async() => {
    const consultas = [];
    const service = comunidadServiceFactory({
      runQuery: async(text) => { consultas.push(text); return []; },
      isConfigured: () => true,
      staffCompanias: '1,3'
    });
    await service.buscarPorCedula('1000903198');
    assert.ok(consultas.some((q) => q.includes('f200_id_cia IN (1, 3)')));
  });

  it('normalizeCelular should keep only Colombian mobile numbers', () => {
    assert.strictEqual(normalizeCelular('+57 310 444 5566'), '3104445566');
    assert.strictEqual(normalizeCelular('3001112233'), '3001112233');
    assert.strictEqual(normalizeCelular('5962836'), null, 'Landlines are not personal contacts');
    assert.strictEqual(normalizeCelular(null), null);
  });

  it('should find a mother and return her family code', async() => {
    const result = await makeService(DB).buscarPorCedula('43999888');

    assert.deepStrictEqual(result, {
      configurado: true, encontrado: true, relaciones: ['padre'], codigo_familia: '4521', nombre: 'Marta Pérez', telefono: '3104445566'
    });
  });

  it('should find a student with the family code from students', async() => {
    const result = await makeService(DB).buscarPorCedula('1011222333');

    assert.deepStrictEqual(result.relaciones, ['estudiante']);
    assert.strictEqual(result.codigo_familia, '4521');
  });

  it('should mark an employee who is also a parent as staff and padre', async() => {
    const result = await makeService(DB).buscarPorCedula('71000111');

    assert.deepStrictEqual(result.relaciones.sort(), ['padre', 'staff']);
    assert.strictEqual(result.codigo_familia, '7788');
    assert.strictEqual(result.nombre, 'CARLOS RUIZ MEJIA');
  });

  it('should report not found', async() => {
    const result = await makeService(DB).buscarPorCedula('99999999');

    assert.strictEqual(result.encontrado, false);
    assert.deepStrictEqual(result.relaciones, []);
  });

  it('should return configurado=false when SQL Server is not configured', async() => {
    assert.deepStrictEqual(await makeService(DB, false).buscarPorCedula('43999888'), { configurado: false });
  });

  it('should answer 503 when the school database fails', async() => {
    const service = comunidadServiceFactory({
      runQuery: async() => { throw new Error('ETIMEOUT'); },
      isConfigured: () => true
    });

    await assert.rejects(() => service.buscarPorCedula('43999888'), (error) => error.statusCode === 503);
  });

  describe('verificarRegistro (no bloquea, marca para revisión)', () => {
    it('should verify a parent and take the family code from the school', async() => {
      const result = await makeService(DB).verificarRegistro({ cedula: '43999888', relacion_tcs: ['padre'], codigo_familia: 'otro' });

      assert.deepStrictEqual(result, { verificacion_comunidad: 'verificado', verificacion_detalle: null, codigo_familia: '4521' });
    });

    it('should flag a relation that does not match the school database', async() => {
      const result = await makeService(DB).verificarRegistro({ cedula: '43999888', relacion_tcs: ['padre', 'staff'] });

      assert.strictEqual(result.verificacion_comunidad, 'revisar');
      assert.match(result.verificacion_detalle, /staff/);
    });

    it('should let an unknown cédula register as no_encontrado', async() => {
      const result = await makeService(DB).verificarRegistro({ cedula: '99999999', relacion_tcs: ['padre'] });

      assert.strictEqual(result.verificacion_comunidad, 'no_encontrado');
    });

    it('should flag alumni (egresados) for manual review', async() => {
      const result = await makeService(DB).verificarRegistro({ cedula: '43999888', relacion_tcs: ['padre', 'egresado'] });

      assert.strictEqual(result.verificacion_comunidad, 'revisar');
      assert.match(result.verificacion_detalle, /egresado/);
    });

    it('should not block when the school database is down', async() => {
      const service = comunidadServiceFactory({
        runQuery: async() => { throw new Error('ETIMEOUT'); },
        isConfigured: () => true
      });
      const result = await service.verificarRegistro({ cedula: '43999888', relacion_tcs: ['padre'] });

      assert.strictEqual(result.verificacion_comunidad, 'pendiente');
    });

    it('should leave the record pending when SQL Server is not configured', async() => {
      const result = await makeService(DB, false).verificarRegistro({ cedula: '99999999', relacion_tcs: ['padre'] });

      assert.deepStrictEqual(result, { verificacion_comunidad: 'pendiente', verificacion_detalle: null });
    });
  });
});
