import { getRepository, getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enought balance');
    }

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (checkCategoryExists) {
      const objTransaction = transactionsRepository.create({
        title,
        value,
        type,
        category: checkCategoryExists,
      });
      const newTransaction = await transactionsRepository.save(objTransaction);
      return newTransaction;
    }
    const objCategory = categoriesRepository.create({ title: category });
    const newCategory = await categoriesRepository.save(objCategory);

    const objTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category: newCategory,
    });
    await transactionsRepository.save(objTransaction);

    return objTransaction;
  }
}

export default CreateTransactionService;
