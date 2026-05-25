const { Router } = require('express');
const { body } = require('express-validator');
const experimentController = require('../controllers/experimentController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.use(authenticate);

router.get('/', experimentController.list);
router.get('/active/current', experimentController.getActive);
router.post('/compute', experimentController.computeLive);
router.get('/:id/export', experimentController.exportReport);
router.get('/:id', experimentController.getOne);
router.post('/', experimentController.create);
router.put(
  '/:id',
  [
    body('temperature').optional().isFloat({ min: 273, max: 373 }),
    body('pressure').optional().isFloat({ min: 0, max: 5 }),
    body('conc_a').optional().isFloat({ min: 0, max: 1 }),
    body('conc_b').optional().isFloat({ min: 0, max: 1 }),
  ],
  validate,
  experimentController.update
);
router.delete('/:id', experimentController.remove);
router.post('/:id/reactants', body('compound_id').isUUID(), validate, experimentController.addReactant);
router.delete('/:id/reactants/:compoundId', experimentController.removeReactant);
router.post('/:id/reset', experimentController.reset);
router.post('/:id/next-step', experimentController.nextStep);
router.post('/:id/predict', experimentController.predict);

module.exports = router;
