"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vesselController_1 = require("../controllers/vesselController");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
const vesselUploadFields = upload_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]);
router.get('/', vesselController_1.getAll);
router.get('/:id', vesselController_1.getOne);
router.post('/', auth_1.authenticateToken, vesselUploadFields, vesselController_1.create);
router.put('/:id', auth_1.authenticateToken, vesselUploadFields, vesselController_1.update);
router.delete('/:id', auth_1.authenticateToken, vesselController_1.deleteVessel);
exports.default = router;
