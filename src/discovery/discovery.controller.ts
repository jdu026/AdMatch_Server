import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('models')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Post()
  create(@Body() data: any) {
    return this.discoveryService.create(data);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    return this.discoveryService.findModels({
      category,
      region,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    });
  }
}
