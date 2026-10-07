import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../auth/auth-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

@Controller('favorites')
@UseGuards(JwtGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user.id);
  }

  @Post(':toiletId')
  async add(
    @Param('toiletId') toiletId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.favoritesService.add(user.id, toiletId);
  }

  @Delete(':toiletId')
  async remove(
    @Param('toiletId') toiletId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.favoritesService.remove(user.id, toiletId);
  }
}