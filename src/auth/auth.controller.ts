import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService, AuthResult, AuthUser } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './auth-user.decorator';
import { JwtGuard } from './jwt.guard';

interface AuthUserShape {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async me(@CurrentUser() user: AuthUserShape): Promise<AuthUser> {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }
}
