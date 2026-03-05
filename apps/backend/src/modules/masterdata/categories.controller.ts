import { Controller, Get, UseGuards } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly masterdataService: MasterdataService) { }
    @Get()
    findAll() { return this.masterdataService.findAllCategories(); }
}

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
    constructor(private readonly masterdataService: MasterdataService) { }
    @Get()
    findAll() { return this.masterdataService.findAllBrands(); }
}

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitsController {
    constructor() { }
    @Get()
    findAll() {
        return [
            { id: '1', name: 'Cái', code: 'CAI' },
            { id: '2', name: 'Chiếc', code: 'CHIEC' },
            { id: '3', name: 'Bộ', code: 'BO' }
        ];
    }
}
