import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  // Filter list by state/city/items
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(', ')
      .map(item => Number(item.trim()));

    // Query to database
    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      // Return only point of distinct collects
      .distinct()
      .select('points.*');

      const serializedPoints = points.map(point => {
        return {
          ...point,
          image_url: `http://192.168.10.104:3333/uploads/${point.image}`,
        };
      });

    return response.json(serializedPoints);
  }

  // List a specific collects point
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ message: 'Point not found.' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.10.104:3333/uploads/${point.image}`,
    };

    // Listing items that relate to that collection point
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point: serializedPoint, items });
  }

  // Create collects point
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    const trx = await knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };
  
    const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0];
    
    // Relationship with the items table
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
    })
  
    await trx('point_items').insert(pointItems);

    // Here it really does the inserts in the database
    await trx.commit();
  
    return response.json({
      id: point_id,
      ...point, 
    });
  };
}

export default PointsController;