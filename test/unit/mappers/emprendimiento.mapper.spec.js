import assert from 'node:assert';
import { describe, it } from 'node:test';

import { mapEmprendimiento, mapEmprendimientoResponse, toArray } from '#mappers/emprendimiento.mapper';
import { emprendimientoSchema } from '#schemas/emprendimiento.schema';
import { emprendimientoBodyMock, emprendimientoDbMock } from '#test/mocks/emprendimiento.mock';

const LOGO = 'http://localhost:3000/api/v1/uploads/emprendimientos/logo-1.png';

describe('Mapper: mapEmprendimiento', () => {
  it('should normalize a multipart body (bracket arrays, phones, email, @)', () => {
    const result = mapEmprendimiento(emprendimientoBodyMock, { logo: LOGO, fotos: [] });

    assert.deepStrictEqual(result.relacion_tcs, ['padre', 'egresado']);
    assert.deepStrictEqual(result.categorias, ['gastronomia', 'otro']);
    assert.strictEqual(result.categoria_otro, 'Conservas');
    assert.strictEqual(result.telefono_personal, '573001112233')
    assert.strictEqual(result.cedula, '1017234567', 'La cédula se normaliza a solo dígitos')
    assert.strictEqual(result.codigo_familia, 'FAM-123')
    assert.strictEqual(result.red_social_tipo, 'instagram')
    assert.deepStrictEqual(result.beneficio_condiciones, ['noAcumulable']);
    assert.strictEqual(result.email, 'hola@salsisa.co');
    assert.strictEqual(result.red_social, 'salsisa');
    assert.strictEqual(result.envios, null, 'Expected empty optional to be null');
    assert.strictEqual(result.acepta_datos, true);
    assert.strictEqual(result.beneficio_tcs, true);
    assert.strictEqual(result.logo, LOGO);
  });

  it('should accept plain field names and a single value as array', () => {
    const result = mapEmprendimiento({ ...emprendimientoBodyMock, 'categorias[]': undefined, categorias: 'moda' });

    assert.deepStrictEqual(result.categorias, ['moda']);
    assert.strictEqual(result.categoria_otro, null, 'categoria_otro only applies with "otro"');
  });

  it('should drop beneficio_descripcion when beneficio_tcs is no', () => {
    const result = mapEmprendimiento({ ...emprendimientoBodyMock, beneficio_tcs: 'no' });

    assert.strictEqual(result.beneficio_tcs, false);
    assert.strictEqual(result.beneficio_descripcion, null);
  });

  it('should produce an object that passes the Joi schema', () => {
    const mapped = mapEmprendimiento(emprendimientoBodyMock, { logo: LOGO, fotos: [] });
    const { error } = emprendimientoSchema.validate(mapped);

    assert.strictEqual(error, undefined, error?.message);
  });

  it('toArray should handle undefined, string and array', () => {
    assert.deepStrictEqual(toArray(undefined), []);
    assert.deepStrictEqual(toArray('a'), ['a']);
    assert.deepStrictEqual(toArray(['a', '', 'b']), ['a', 'b']);
  });
});

describe('Mapper: mapEmprendimientoResponse', () => {
  it('should map a plain object to the API shape', () => {
    const result = mapEmprendimientoResponse(emprendimientoDbMock);

    assert.strictEqual(result.beneficio_tcs, 'si');
    assert.deepStrictEqual(result.fotos, []);
    assert.strictEqual(result.createdAt, emprendimientoDbMock.createdAt);
  });

  it('should include the donation summary only when fuentePago was loaded', () => {
    assert.strictEqual('donacion' in mapEmprendimientoResponse(emprendimientoDbMock), false);

    const result = mapEmprendimientoResponse({
      ...emprendimientoDbMock,
      fuentePago: { donation_value: 10000, billing_frequency: 'monthly', type: 'NEQUI', status: 'available', name: 'Isabel', last_name: 'Páez' }
    });
    assert.strictEqual(result.donacion.valor, 10000);
    assert.strictEqual(result.donacion.donante, 'Isabel Páez');
  });

  it('should unwrap a Sequelize instance via get({ plain: true })', () => {
    const instance = { get: () => ({ ...emprendimientoDbMock, beneficio_tcs: false }) };
    const result = mapEmprendimientoResponse(instance);

    assert.strictEqual(result.beneficio_tcs, 'no');
  });
});

describe('Schema: emprendimientoSchema', () => {
  const valid = mapEmprendimiento(emprendimientoBodyMock, { logo: LOGO, fotos: [] });

  it('should reject when the authorization is not accepted', () => {
    const { error } = emprendimientoSchema.validate({ ...valid, acepta_datos: false });
    assert.match(error.message, /autorización/);
  });

  it('should require categoria_otro when "otro" is selected', () => {
    const { error } = emprendimientoSchema.validate({ ...valid, categoria_otro: null });
    assert.match(error.message, /otra categoría/);
  });

  it('should require beneficio_descripcion when beneficio_tcs is true', () => {
    const { error } = emprendimientoSchema.validate({ ...valid, beneficio_descripcion: '' });
    assert.match(error.message, /beneficio/);
  });

  it('should not require the recurring donation anymore', () => {
    const { error } = emprendimientoSchema.validate({ ...valid, fuente_pago_id: undefined });
    assert.strictEqual(error, undefined, error?.message);
  });

  it('should require the grade (grado) for students', () => {
    const estudiante = { ...valid, relacion_tcs: ['estudiante'] };
    assert.match(emprendimientoSchema.validate(estudiante).error.message, /grado/);
    assert.strictEqual(emprendimientoSchema.validate({ ...estudiante, grado: '8°' }).error, undefined);
  });

  it('should reject an invalid category and a missing logo', () => {
    assert.ok(emprendimientoSchema.validate({ ...valid, categorias: ['comida'] }).error);
    assert.ok(emprendimientoSchema.validate({ ...valid, logo: undefined }).error);
  });
});
