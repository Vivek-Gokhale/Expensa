const categoryModel = require('../models/categoryModel');
const logger = require('../utils/logger');


const getCategoryDetails = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const categoryDetails = await categoryModel.getCategoriesById(userId);
        console.log(categoryDetails);
        if (!categoryDetails) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category details fetched successfully', data: categoryDetails });
    } catch (error) {
        logger.error('Error fetching category details', error);
        next(error);
    }
};

module.exports = {getCategoryDetails};

