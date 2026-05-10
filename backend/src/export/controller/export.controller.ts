import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserGuard } from 'src/security/guards/auth.guard';
import { ExportService } from '../service/export.service';

@Controller('export')
@UseGuards(UserGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * GET /export/csv
   * Returns a UTF-8 CSV file with a BOM so Excel opens ₦ correctly.
   * Gated: Personal / Family plan (or active trial).
   */
  @Get('csv')
  async downloadCSV(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const csv = await this.exportService.exportCSV(userId);

    const filename = `spendnub-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    // UTF-8 BOM — makes ₦ and other non-ASCII characters render correctly in Excel
    res.send('\uFEFF' + csv);
  }
}
