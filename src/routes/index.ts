import { Router } from 'express';
import usersRouter from '../modules/users/users.routes';

const router = Router();

router.use('/users', usersRouter);

export default router;
