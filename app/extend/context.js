
const traceId = Symbol("_traceId");
module.exports = {

  get traceId() {
    //如果有traceId 则根据traceId继续链路
    if (this.header["x-request-id"]) {
      this[traceId] = Buffer.from(this.header["x-request-id"], "hex").slice(
        0,
        8
      );
    }
    return this[traceId];
  },
  set traceId(_traceId) {
    this[traceId] = _traceId;
  },
  get requestId() {
    return this[traceId].toString("hex");
  },
}
