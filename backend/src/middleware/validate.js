const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Имэйл хаяг буруу байна'),
  username: z.string().min(3, 'Хэрэглэгчийн нэр дор хаяж 3 тэмдэгт байх ёстой').regex(/^[a-zA-Z0-9_]+$/, 'Зөвхөн үсэг, тоо, "_" ашиглана'),
  password: z.string().min(8, 'Нууц үг дор хаяж 8 тэмдэгт байх ёстой'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  age: z.number().int().min(18, 'Хэрэглэгч 18-аас дээш насны байх ёстой').max(99).optional(),
  city: z.string().max(100).optional(),
  relationshipGoal: z.string().max(100).optional(),
});

const swipeSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(['LIKE', 'PASS', 'SUPERLIKE']),
});

const messageSchema = z.object({
  matchId: z.string().uuid(),
  text: z.string().min(1).max(2000),
});

// Ерөнхий validation middleware
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Оруулсан мэдээлэл буруу байна',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data; // parse хийсэн, зөвхөн зөвшөөрөгдсөн field-үүдээр солино (mass assignment-аас хамгаална)
    next();
  };
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  profileSchema,
  swipeSchema,
  messageSchema,
};
