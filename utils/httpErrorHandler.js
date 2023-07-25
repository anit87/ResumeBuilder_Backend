const { ERROR_PLACEHOLDER, USER_NOT_FOUND, ZOOM_USER_ID_MISSING } = require('../constants');

const httpErrorHandler = ({
  error, res, customMessage = ERROR_PLACEHOLDER,
}) => {
  if (!res) return null;

  const { status, data } = error?.response || {};
  const responseMessage = data?.message || error?.message || customMessage;

  const responseStatus = (() => {
    if (status) return status;
    if (responseMessage === USER_NOT_FOUND) return 404;
    if (responseMessage === ZOOM_USER_ID_MISSING) return 400;
    return 500;
  })();

  return res.status(responseStatus).json({ message: responseMessage });
};

module.exports = httpErrorHandler;
