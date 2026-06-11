import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailySummary(query: ReportQueryDto) {
    const dateStr = query.date ?? new Date().toISOString().split('T')[0];
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);

    const aggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    let totalCredits = 0;
    let totalDebits = 0;
    let transactionCount = 0;

    for (const group of aggregations) {
      if (group.type === 'CREDIT') {
        totalCredits = group._sum.amount ?? 0;
      } else if (group.type === 'DEBIT') {
        totalDebits = group._sum.amount ?? 0;
      }
      transactionCount += group._count.id;
    }

    const walletAggregations = await this.prisma.transaction.groupBy({
      by: ['walletId'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const activeWallets = walletAggregations.length;

    return {
      date: dateStr,
      totalCredits,
      totalDebits,
      transactionCount,
      activeWallets,
    };
  }

  async getDashboardStats() {
    const totalWallets = await this.prisma.wallet.count();

    const balanceAggregation = await this.prisma.wallet.aggregate({
      _sum: {
        balance: true,
      },
    });
    const totalBalance = balanceAggregation._sum.balance ?? 0;

    const txAggregation = await this.prisma.transaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    let totalCredits = 0;
    let totalDebits = 0;
    let transactionCount = 0;

    for (const group of txAggregation) {
      if (group.type === 'CREDIT') {
        totalCredits = group._sum.amount ?? 0;
      } else if (group.type === 'DEBIT') {
        totalDebits = group._sum.amount ?? 0;
      }
      transactionCount += group._count.id;
    }

    return {
      totalWallets,
      totalBalance,
      totalCredits,
      totalDebits,
      transactionCount,
    };
  }
}
