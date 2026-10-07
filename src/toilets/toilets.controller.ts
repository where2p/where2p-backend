import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ToiletsService, ToiletSearchQuery } from './toilets.service';
import { SubmitToiletDto } from './dto/submit-toilet.dto';
import { CurrentUser } from '../auth/auth-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

@Controller('toilets')
export class ToiletsController {
  constructor(private readonly toiletsService: ToiletsService) {}

  @Get()
  async search(
    @Query('isFree') isFree?: string,
    @Query('isWheelchairAccessible') isWheelchairAccessible?: string,
    @Query('isOpen247') isOpen247?: string,
    @Query('search') search?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    const query: ToiletSearchQuery = {};
    if (isFree) query.isFree = isFree === 'true';
    if (isWheelchairAccessible)
      query.isWheelchairAccessible = isWheelchairAccessible === 'true';
    if (isOpen247) query.isOpen247 = isOpen247 === 'true';
    if (search) query.search = search;
    if (lat) query.lat = Number(lat);
    if (lng) query.lng = Number(lng);
    if (radiusKm) query.radiusKm = Number(radiusKm);
    return this.toiletsService.search(query);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.toiletsService.findById(id, user);
  }

  @Post('submit')
  @UseGuards(JwtGuard)
  async submit(
    @Body() dto: SubmitToiletDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.toiletsService.submit(dto, user.id);
  }
}