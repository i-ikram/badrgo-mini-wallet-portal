import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Wallet Operations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clear database before each test to guarantee isolated states
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user, wallet, and perform credit and debit operations', async () => {
    // 1. Create a user
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Jane Doe',
        phone: '+987654321',
        email: 'jane.doe@example.com',
      })
      .expect(201);

    const userId = userRes.body.id;
    expect(userId).toBeDefined();

    // 2. Create a wallet
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .send({
        userId,
        currency: 'USD',
      })
      .expect(201);

    const walletId = walletRes.body.id;
    expect(walletId).toBeDefined();
    expect(walletRes.body.balance).toBe(0);

    // 3. Credit the wallet
    const creditRes = await request(app.getHttpServer())
      .post(`/wallets/${walletId}/credit`)
      .send({
        amount: 2500, // 25.00
        referenceId: 'ref-credit-1',
        description: 'Initial deposit',
      })
      .expect(201);

    expect(creditRes.body.amount).toBe(2500);
    expect(creditRes.body.balanceBefore).toBe(0);
    expect(creditRes.body.balanceAfter).toBe(2500);
    expect(creditRes.body.type).toBe('CREDIT');

    // Verify wallet balance updated
    let wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    expect(wallet?.balance).toBe(2500);

    // 4. Debit the wallet
    const debitRes = await request(app.getHttpServer())
      .post(`/wallets/${walletId}/debit`)
      .send({
        amount: 1000, // 10.00
        referenceId: 'ref-debit-1',
        description: 'Buy coffee',
      })
      .expect(201);

    expect(debitRes.body.amount).toBe(1000);
    expect(debitRes.body.balanceBefore).toBe(2500);
    expect(debitRes.body.balanceAfter).toBe(1500);
    expect(debitRes.body.type).toBe('DEBIT');

    // Verify wallet balance updated
    wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    expect(wallet?.balance).toBe(1500);
  });

  it('should prevent duplicate transactions (idempotency)', async () => {
    // Setup user and wallet
    const user = await prisma.user.create({
      data: { name: 'Idemp Tester', phone: '111', email: 'idemp@test.com' },
    });
    const wallet = await prisma.wallet.create({
      data: { userId: user.id, currency: 'USD', balance: 5000 },
    });

    const payload = {
      amount: 1000,
      referenceId: 'unique-ref-999',
      description: 'Idempotent test',
    };

    // First request: Succeeds
    await request(app.getHttpServer())
      .post(`/wallets/${wallet.id}/debit`)
      .send(payload)
      .expect(201);

    // Second request: Fails with 409 Conflict
    await request(app.getHttpServer())
      .post(`/wallets/${wallet.id}/debit`)
      .send(payload)
      .expect(409);

    // Verify balance was only deducted once
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    });
    expect(updatedWallet?.balance).toBe(4000);
  });

  it('should prevent overdraft (negative balance)', async () => {
    // Setup user and wallet
    const user = await prisma.user.create({
      data: { name: 'Overdraft Tester', phone: '222', email: 'over@test.com' },
    });
    const wallet = await prisma.wallet.create({
      data: { userId: user.id, currency: 'USD', balance: 500 }, // $5.00
    });

    // Attempt to debit $10.00 (1000 cents)
    const res = await request(app.getHttpServer())
      .post(`/wallets/${wallet.id}/debit`)
      .send({
        amount: 1000,
        referenceId: 'overdraft-ref',
        description: 'Overspend attempt',
      })
      .expect(400);

    expect(res.body.message).toBe('Insufficient funds');

    // Verify balance unchanged
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    });
    expect(updatedWallet?.balance).toBe(500);
  });

  it('should handle concurrent debits safely without balance corruption', async () => {
    // Setup user and wallet
    const user = await prisma.user.create({
      data: { name: 'Concur Tester', phone: '333', email: 'concur@test.com' },
    });
    const wallet = await prisma.wallet.create({
      data: { userId: user.id, currency: 'USD', balance: 1500 }, // $15.00
    });

    // Fire 3 parallel debits of $10.00 each.
    // The wallet balance is $15.00, so only 1 debit must succeed and the other two must fail.
    const requests = [1, 2, 3].map((num) =>
      request(app.getHttpServer())
        .post(`/wallets/${wallet.id}/debit`)
        .send({
          amount: 1000,
          referenceId: `concur-ref-${num}`,
          description: `Concurrent debit ${num}`,
        }),
    );

    const results = await Promise.all(requests);

    const successResponses = results.filter((res) => res.status === 201);
    const failedResponses = results.filter((res) => res.status === 400);

    // Exactly one should succeed, and two should fail
    expect(successResponses.length).toBe(1);
    expect(failedResponses.length).toBe(2);

    failedResponses.forEach((res) => {
      expect(res.body.message).toBe('Insufficient funds');
    });

    // Verify remaining balance is exactly 500
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    });
    expect(updatedWallet?.balance).toBe(500);
  });
});
