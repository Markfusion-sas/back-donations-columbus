import { donationCertificateSchema, linkCertificateSchema } from '#schemas/donationCertificate.schema';

const validateWith = (schema, getData) => (req, res, next) => {
  const { error } = schema.validate(getData(req), { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/** Valida la solicitud de certificado (`req.certificado`, construido por uploadCertificado). */
export const validateCertificadoRequest = validateWith(donationCertificateSchema, (req) => req.certificado);

/** Valida el body de vinculación ({ reference }). */
export const validateLinkCertificadoRequest = validateWith(linkCertificateSchema, (req) => req.body ?? {});
