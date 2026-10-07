import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingDto } from './dto/rating.dto';
import { CurrentUser } from '../auth/auth-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

@Controller('toilets')
@UseGuards(JwtGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':id/rate')
  async rate(
    @Param('id') id: string,
    @Body() dto: RatingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ratingsService.upsert(user.id, id, dto.score, dto.note);
  }
}