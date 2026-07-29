// Express 4 нь async функц дотор шидэгдсэн алдааг автоматаар барьдаггүй.
// Үүнийг ороож next(err)-рүү дамжуулснаар errorHandler middleware барьж чадна.
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
