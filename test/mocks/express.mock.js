export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  locals: {},
  ...overrides,
});

export const mockResponse = () => {
  const headers = {};
  const res = {
    statusCode: 0,
    jsonPayload: null,
    headers,
    locals: {},

    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (payload) => {
      res.jsonPayload = payload;
      return res;
    },
    header(name, value) {
      this.headers[name] = value;
      return this;
    },
  };
  return res;
};

export const mockNext = () => {
  const calls = [];
  const next = (err) => calls.push(err);

  next.calledWith = (expectedError) => calls.some((call) => call === expectedError);
  next.wasCalled = () => calls.length > 0;
  next.callCount = () => calls.length;
  next.getCalls = () => calls;

  return next;
};
