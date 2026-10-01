import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';
import { mapEmprendimientoResponse } from '#mappers/emprendimiento.mapper';
import { emprendimientoServiceFactory } from '#services/emprendimiento.service';
import { emprendimientoDbMock } from '#test/mocks/emprendimiento.mock';

const makeRecord = (overrides = {}) => {
  const record = { ...emprendimientoDbMock, ...overrides };
  record.update = async(patch) => Object.assign(record, patch);
  return record;
};

describe('Service: emprendimientoService', () => {
  let fakeModel;
  let notifications;
  let service;

  beforeEach(() => {
    notifications = [];

    fakeModel = {
      create: async(data) => makeRecord(data),
      findAll: async() => [makeRecord(), makeRecord({ id: 'otro-id', estado: 'aprobado' })],
      findByPk: async(id) => (id === emprendimientoDbMock.id ? makeRecord() : null)
    };

    service = emprendimientoServiceFactory({
      Emprendimiento: fakeModel,
      mapEmprendimientoResponse,
      notifyNewEmprendimiento: async(e) => notifications.push(['nuevo', e.nombre_emprendimiento]),
      notifyApproved: async(e) => notifications.push(['aprobado', e.email]),
      notifyRejected: async(e) => notifications.push(['rechazado', e.motivo_rechazo])
    });
  });

  it('should create with estado pendiente and alert the admin', async() => {
    const result = await service.createEmprendimiento({ ...emprendimientoDbMock, estado: 'aprobado' });

    assert.strictEqual(result.estado, EMPRENDIMIENTO_STATUS.PENDING, 'Expected new records to be pending');
    assert.strictEqual(result.beneficio_tcs, 'si', 'Expected boolean to be mapped to si/no');
    assert.deepStrictEqual(notifications, [['nuevo', 'Salsisa']]);
  });

  it('should filter by estado when provided', async() => {
    let receivedWhere = null;
    fakeModel.findAll = async({ where }) => {
      receivedWhere = where;
      return [makeRecord({ estado: 'aprobado' })];
    };

    const result = await service.getEmprendimientos({ estado: 'aprobado' });

    assert.deepStrictEqual(receivedWhere, { estado: 'aprobado' });
    assert.strictEqual(result.length, 1);
  });

  it('should list all when no estado is provided', async() => {
    let receivedWhere = null;
    fakeModel.findAll = async({ where }) => {
      receivedWhere = where;
      return [];
    };

    await service.getEmprendimientos();

    assert.deepStrictEqual(receivedWhere, {});
  });

  it('should approve, clear motivo and notify the representative', async() => {
    const result = await service.aprobarEmprendimiento(emprendimientoDbMock.id);

    assert.strictEqual(result.estado, EMPRENDIMIENTO_STATUS.APPROVED);
    assert.strictEqual(result.motivo_rechazo, null);
    assert.ok(result.revisado_en, 'Expected revisado_en to be set');
    assert.deepStrictEqual(notifications, [['aprobado', 'hola@salsisa.co']]);
  });

  it('should reject with motivo and notify the representative', async() => {
    const result = await service.rechazarEmprendimiento(emprendimientoDbMock.id, 'Falta información');

    assert.strictEqual(result.estado, EMPRENDIMIENTO_STATUS.REJECTED);
    assert.strictEqual(result.motivo_rechazo, 'Falta información');
    assert.deepStrictEqual(notifications, [['rechazado', 'Falta información']]);
  });

  it('should throw 404 when the record does not exist', async() => {
    await assert.rejects(
      () => service.aprobarEmprendimiento('no-existe'),
      (error) => error.statusCode === 404
    );
  });

  it('should not fail when a notification throws', async() => {
    const errors = [];
    service = emprendimientoServiceFactory({
      Emprendimiento: fakeModel,
      mapEmprendimientoResponse,
      notifyApproved: async() => { throw new Error('Resend caído'); },
      errorLog: (...args) => errors.push(args)
    });

    const result = await service.aprobarEmprendimiento(emprendimientoDbMock.id);

    assert.strictEqual(result.estado, EMPRENDIMIENTO_STATUS.APPROVED);
    assert.strictEqual(errors.length, 1, 'Expected the notification error to be logged');
  });

  describe('donación recurrente (opcional)', () => {
    const FUENTE_ID = emprendimientoDbMock.fuente_pago_id;
    let usados;

    beforeEach(() => {
      usados = 0;
      fakeModel.count = async({ where }) => (where.fuente_pago_id === FUENTE_ID ? usados : 0);
      service = emprendimientoServiceFactory({
        Emprendimiento: fakeModel,
        mapEmprendimientoResponse,
        PaymentSource: { findByPk: async(id) => (id === FUENTE_ID ? { id, donation_value: 5000 } : null) },
        notifyNewEmprendimiento: async(e, fuente) => notifications.push(['nuevo', fuente?.donation_value])
      });
    });

    it('should create and alert only the admin (the representative is emailed on approval)', async() => {
      const result = await service.createEmprendimiento({ ...emprendimientoDbMock });

      assert.strictEqual(result.fuente_pago_id, FUENTE_ID);
      assert.deepStrictEqual(notifications, [['nuevo', 5000]]);
    });

    it('should register without a recurring donation', async() => {
      const result = await service.createEmprendimiento({ ...emprendimientoDbMock, fuente_pago_id: undefined });

      assert.strictEqual(result.estado, EMPRENDIMIENTO_STATUS.PENDING);
      assert.deepStrictEqual(notifications, [['nuevo', undefined]]);
    });

    it('should reject an unknown payment source with 400', async() => {
      await assert.rejects(
        () => service.createEmprendimiento({ ...emprendimientoDbMock, fuente_pago_id: '00000000-0000-4000-8000-000000000000' }),
        (error) => error.statusCode === 400
      );
    });

    it('should reject a payment source already used by another record with 409', async() => {
      usados = 1;
      await assert.rejects(
        () => service.createEmprendimiento({ ...emprendimientoDbMock }),
        (error) => error.statusCode === 409
      );
    });

    it('should save the school verification without blocking the registration', async() => {
      service = emprendimientoServiceFactory({
        Emprendimiento: fakeModel,
        mapEmprendimientoResponse,
        PaymentSource: { findByPk: async(id) => ({ id }) },
        verificarComunidad: async({ cedula }) => (cedula === '1'
          ? { verificacion_comunidad: 'no_encontrado', verificacion_detalle: 'No aparece' }
          : { verificacion_comunidad: 'verificado', verificacion_detalle: null, codigo_familia: '4521' })
      });

      const result = await service.createEmprendimiento({ ...emprendimientoDbMock });
      assert.strictEqual(result.verificacion_comunidad, 'verificado');
      assert.strictEqual(result.codigo_familia, '4521');

      // Si no aparece en la base se registra igual, marcado para revisión
      const noEncontrado = await service.createEmprendimiento({ ...emprendimientoDbMock, cedula: '1' });
      assert.strictEqual(noEncontrado.verificacion_comunidad, 'no_encontrado');
      assert.strictEqual(noEncontrado.verificacion_detalle, 'No aparece');
    });

    it('should require a family code for parents not found in the school database', async() => {
      service = emprendimientoServiceFactory({
        Emprendimiento: fakeModel,
        mapEmprendimientoResponse,
        verificarComunidad: async() => ({ verificacion_comunidad: 'no_encontrado', verificacion_detalle: 'No aparece' })
      });

      await assert.rejects(
        () => service.createEmprendimiento({ ...emprendimientoDbMock, codigo_familia: null }),
        (error) => error.statusCode === 400 && /código de familia/.test(error.message)
      );
      const ok = await service.createEmprendimiento({ ...emprendimientoDbMock, codigo_familia: 'FAM-9' });
      assert.strictEqual(ok.codigo_familia, 'FAM-9');
    });

    it('should not change the payment source when editing', async() => {
      const result = await service.updateEmprendimiento(emprendimientoDbMock.id, {
        ...emprendimientoDbMock,
        fuente_pago_id: '00000000-0000-4000-8000-000000000000'
      }, []);

      assert.strictEqual(result.fuente_pago_id, FUENTE_ID);
    });
  });
});
