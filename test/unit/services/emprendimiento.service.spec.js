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
});
