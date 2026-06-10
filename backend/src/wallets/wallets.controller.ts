import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletOperationDto } from './dto/wallet-operation.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { Wallet, Transaction } from '@prisma/client';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet for a user' })
  @ApiResponse({ status: 201, description: 'Wallet successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    return this.walletsService.create(createWalletDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 200, description: 'Return wallet details.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  findOne(@Param('id') id: string): Promise<Wallet> {
    return this.walletsService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of all wallets' })
  @ApiResponse({ status: 200, description: 'Return list of wallets.' })
  findAll(): Promise<Wallet[]> {
    return this.walletsService.findAll();
  }

  @Post(':id/credit')
  @ApiOperation({ summary: 'Credit funds to a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 201, description: 'Wallet successfully credited, transaction recorded.' })
  @ApiResponse({ status: 400, description: 'Invalid input or inactive wallet.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  @ApiResponse({ status: 409, description: 'Idempotency key / Reference ID conflict.' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  credit(@Param('id') id: string, @Body() operationDto: WalletOperationDto): Promise<Transaction> {
    return this.walletsService.credit(id, operationDto);
  }

  @Post(':id/debit')
  @ApiOperation({ summary: 'Debit funds from a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 201, description: 'Wallet successfully debited, transaction recorded.' })
  @ApiResponse({ status: 400, description: 'Insufficient funds, invalid input, or inactive wallet.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  @ApiResponse({ status: 409, description: 'Idempotency key / Reference ID conflict.' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  debit(@Param('id') id: string, @Body() operationDto: WalletOperationDto): Promise<Transaction> {
    return this.walletsService.debit(id, operationDto);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transaction history of a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 200, description: 'Return transaction history.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  findTransactions(
    @Param('id') id: string,
    @Query() query: GetTransactionsDto,
  ): Promise<Transaction[]> {
    return this.walletsService.findTransactions(id, query);
  }
}
