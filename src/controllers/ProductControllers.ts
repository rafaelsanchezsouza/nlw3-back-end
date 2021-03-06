import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Image from '../models/images';
import Product from '../models/product';
import productView from '../views/product_view';
import * as Yup from 'yup';

export default {
  async index(request: Request, response: Response) {
    // console.log('Hello Index!');
    const productRepository = getRepository(Product);

    const products = await productRepository.find({
      relations: ['image'],
    });
    return response.json(productView.renderMany(products));
    // return response.json(products);
  },

  async show(request: Request, response: Response) {
    // console.log('Hello Show!');
    const { id } = request.params;

    const productRepository = getRepository(Product);

    const product = await productRepository.findOneOrFail(id, {
      relations: ['image'],
    });

    return response.json(productView.render(product));
  },

  async create(request: Request, response: Response) {
    const { name, categoria, medida, preco_final } = request.body;

    const requestImage = request.file.filename;
    const image = { path: requestImage };

    const productRepository = getRepository(Product);

    const data = {
      name,
      categoria,
      medida,
      preco_final,
      image,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      categoria: Yup.string().required(),
      medida: Yup.string().required(),
      preco_final: Yup.string().required(),
      image: Yup.object().shape({ path: Yup.string().required() }),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const product = productRepository.create(data);

    await productRepository.save(product);

    return response.status(201).json(product);
  },
};
