import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet, WalletStatus } from '@prisma/client';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    // Validate that the user exists (will throw NotFoundException if not found)
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
}
