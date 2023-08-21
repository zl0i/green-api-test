import { Router } from "express"
import HttpErrorHandler from "../httpErrorHandler"
import { JobController } from "./job.controller"

const router = Router()


router.post('/', async (req, res) => {
    try {
        res.json({
            success: await JobController.work(req.body)
        })
    } catch (error: any) {
        HttpErrorHandler.handle(error, res)
    }
})


export default router