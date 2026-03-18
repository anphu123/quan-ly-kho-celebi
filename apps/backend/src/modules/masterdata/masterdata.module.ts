import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoriesController } from './categories.controller';
import { BrandsController } from './brands.controller';
import { ProductTemplatesController } from './product-templates.controller';
import { SuppliersController } from './suppliers.controller';
import { CustomersController } from './customers.controller';
import { WarehousesController } from './warehouses.controller';
import { MasterdataService } from './masterdata.service';

@Module({
    imports: [PrismaModule],
    controllers: [
        CategoriesController,
        BrandsController,
        ProductTemplatesController,
        SuppliersController,
        CustomersController,
        WarehousesController,
    ],
    providers: [MasterdataService],
    exports: [MasterdataService],
})
export class MasterdataModule { }
