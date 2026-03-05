import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductsController } from './products.controller';
import { CustomersController } from './customers.controller';
import { SuppliersController } from './suppliers.controller';
import { WarehousesController } from './warehouses.controller';
import { CategoriesController, BrandsController, UnitsController } from './categories.controller';
import { InventoryController } from './inventory.controller';
import { MasterdataService } from './masterdata.service';
import { InventoryService } from './inventory.service';

@Module({
    imports: [PrismaModule],
    controllers: [
        ProductsController,
        CustomersController,
        SuppliersController,
        WarehousesController,
        CategoriesController,
        BrandsController,
        UnitsController,
        InventoryController,
    ],
    providers: [MasterdataService, InventoryService],
    exports: [MasterdataService, InventoryService],
})
export class MasterdataModule { }
