import Department from './Department.model.js';
import { errorHandler } from '../../utils/error.js';

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user.id;

    if (!name) {
      return next(errorHandler(400, 'اسم القسم مطلوب'));
    }

    const newDepartment = await Department.create({
      name,
      description,
      createdBy
    });

    res.status(201).json({
      success: true,
      data: newDepartment
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return next(errorHandler(404, 'القسم غير موجود'));
    }

    res.status(200).json({
      success: true,
      data: updatedDepartment
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return next(errorHandler(404, 'القسم غير موجود'));
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف القسم بنجاح'
    });
  } catch (error) {
    next(error);
  }
};