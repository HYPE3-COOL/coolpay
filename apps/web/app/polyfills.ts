// fixed: Do not know how to serialize a BigInt
// @ts-expect-error BigInt is not defined
BigInt.prototype.toJSON = function () {
  return this.toString();
};
