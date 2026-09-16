const notFound = () => {
  const error = new Error('Solicitud de certificado no encontrada');
  error.statusCode = 404;
  return error;
};

/**
 * Servicio de solicitudes de certificado de donación.
 * @param {object} deps
 * @param {import('sequelize').ModelStatic} deps.DonationCertificate
 * @param {Function} [deps.notifyAdmin] - (certificado, documentoPath) => Promise. Alerta por correo.
 * @param {Function} [deps.errorLog]
 */
export const donationCertificateServiceFactory = ({
  DonationCertificate,
  notifyAdmin = async() => {},
  errorLog = () => {}
}) => {

  const toResponse = (record) => {
    const c = typeof record.get === 'function' ? record.get({ plain: true }) : record;
    return {
      id: c.id,
      donation_reference: c.donation_reference,
      name: c.name,
      last_name: c.last_name,
      email: c.email,
      identity_document: c.identity_document,
      donation_value: c.donation_value,
      donation_destination: c.donation_destination,
      documento_url: c.documento_url,
      documento_nombre: c.documento_nombre,
      estado: c.estado,
      createdAt: c.createdAt ?? c.created_at
    };
  };

  const createCertificateRequest = async({ documento_path, ...data }) => {
    const record = await DonationCertificate.create(data);

    // La notificación nunca debe tumbar la operación principal
    try {
      await notifyAdmin(record, documento_path);
    } catch (error) {
      errorLog('Error al enviar alerta de certificado de donación:', error?.message ?? error);
    }

    return toResponse(record);
  };

  const linkToDonation = async(id, reference) => {
    const record = await DonationCertificate.findByPk(id);
    if (!record) throw notFound();

    await record.update({ donation_reference: reference });

    return toResponse(record);
  };

  return { createCertificateRequest, linkToDonation };

};
