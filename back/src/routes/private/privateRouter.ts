import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as taskHandlers from "../../features/task";

const privateRouter = Router();

// 認証必須のため認証ミドルウェアを実行
privateRouter.use(authMiddleware);

privateRouter.get("/tasks", taskHandlers.listTaskHandler);
privateRouter.post("/tasks", taskHandlers.createTaskHandler);
privateRouter.patch("/tasks/:taskId", taskHandlers.updateTaskHandler);
privateRouter.delete("/tasks/:taskId", taskHandlers.deleteTaskHandler);

export default privateRouter;
