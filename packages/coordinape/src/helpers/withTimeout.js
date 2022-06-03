const delay = (time, cb) => new Promise((res) => setTimeout(res, time)).then(cb)

const withTimeout =
  (cb, timeout = 20000) =>
  async (req, res) =>
    Promise.race([delay(timeout, () => res.status(408).send()), cb(req, res)])

module.exports = withTimeout
