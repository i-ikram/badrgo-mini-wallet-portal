import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletOperationDto } from './dto/wallet-operation.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import {
  Wallet,
  WalletStatus,
  Transaction,
  TransactionType,
} from '@prisma/client';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    await this.usersService.findOne(createWalletDto.userId);

    return this.prisma.wallet.create({
      data: {
        userId: createWalletDto.userId,
        currency: createWalletDto.currency ?? 'USD',
        balance: 0,
        status: WalletStatus.ACTIVE,
      },
    });
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    return wallet;
  }

  async findAll(): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  
  async credit(
    id: string,
    operationDto: WalletOperationDto,
  ): Promise<Transaction> {
    const { amount, referenceId, description } = operationDto;

    return this.prisma.$transaction(async (tx) => {
      const wallets: Wallet[] = await tx.$queryRaw<Wallet[]>`
        SELECT * FROM "Wallet" WHERE "id" = ${id} LIMIT 1 FOR UPDATE
      `;
      const wallet = wallets[0];

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('Cannot credit an inactive wallet');
      }

      const existingTx = await tx.transaction.findUnique({
        where: { referenceId },
      });
      if (existingTx) {
        throw new ConflictException(
          `Transaction with reference ID ${referenceId} already exists`,
        );
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      await tx.wallet.update({
        where: { id },
        data: { balance: balanceAfter },
      });

      return tx.transaction.create({
        data: {
          walletId: id,
          type: TransactionType.CREDIT,
          amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          description,
        },
      });
    });
  }

  
  async debit(
    id: string,
    operationDto: WalletOperationDto,
  ): Promise<Transaction> {
    const { amount, referenceId, description } = operationDto;

    return this.prisma.$transaction(async (tx) => {
      const wallets: Wallet[] = await tx.$queryRaw<Wallet[]>`
        SELECT * FROM "Wallet" WHERE "id" = ${id} LIMIT 1 FOR UPDATE
      `;
      const wallet = wallets[0];

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('Cannot debit an inactive wallet');
      }

      const existingTx = await tx.transaction.findUnique({
        where: { referenceId },
      });
      if (existingTx) {
        throw new ConflictException(
          `Transaction with reference ID ${referenceId} already exists`,
        );
      }

      const balanceBefore = wallet.balance;
      if (balanceBefore < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const balanceAfter = balanceBefore - amount;

      await tx.wallet.update({
        where: { id },
        data: { balance: balanceAfter },
      });

      return tx.transaction.create({
        data: {
          walletId: id,
          type: TransactionType.DEBIT,
          amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          description,
        },
      });
    });
  }

  
  async findTransactions(
    id: string,
    query: GetTransactionsDto,
  ): Promise<Transaction[]> {
    await this.findOne(id);

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    return this.prisma.transaction.findMany({
      where: { walletId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }
}
