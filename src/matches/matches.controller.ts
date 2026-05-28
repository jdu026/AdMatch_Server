import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchStatus } from '../common/enums/status.enum';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id || 'test-user-id';
    return this.matchesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MatchStatus,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'test-user-id';
    return this.matchesService.updateStatus(id, userId, status);
  }
}
