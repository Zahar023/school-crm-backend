export const successResponse = (
  res,
  data = {},
  message = "Успешно",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Ошибка сервера",
  statusCode = 500
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const validationError = (res, errors = []) => {
  res.status(400).json({
    success: false,
    message: "Ошибка валидации",
    errors,
  });
};
