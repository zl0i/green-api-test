import express from 'express'
import morgan from 'morgan';
import jobRouter from './job/job.router'

const api = express()

api.use(express.json());
api.use(express.urlencoded({ extended: false }));
api.get('/healthchecks', (_req, res) => res.end('ok'))
api.use(morgan(':date[iso] :remote-addr :method :url :status :response-time ms'));
api.set('port', 3000);

api.use('/jobs', jobRouter)

export { api }