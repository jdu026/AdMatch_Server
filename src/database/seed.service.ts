import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { OfferEntity } from '../offers/entities/offer.entity';
import { ModelProfileEntity } from '../profiles/entities/model-profile.entity';
import { User } from '../user/entities/user.entity';

const SEED_PASSWORD = 'demo1234';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(ModelProfileEntity)
    private readonly profiles: Repository<ModelProfileEntity>,
    @InjectRepository(CampaignEntity)
    private readonly campaigns: Repository<CampaignEntity>,
    @InjectRepository(OfferEntity)
    private readonly offers: Repository<OfferEntity>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedIfEmpty();
    } catch (e) {
      this.log.warn(
        `시드 데이터를 넣지 못했습니다 (DB 연결 확인): ${e instanceof Error ? e.message : e}`,
      );
    }
  }

  private async seedIfEmpty() {
    const userCount = await this.users.count();
    const profileCount = await this.profiles.count();

    if (userCount > 0 && profileCount > 0) {
      await this.seedCampaignsIfMissing();
      return;
    }

    this.log.log('데모 데이터 시드 중…');
    const hash = await bcrypt.hash(SEED_PASSWORD, 10);

    let advertiser = await this.upsertDemoUser('nike_adv', 'ADVERTISER', hash);
    let seoyeon = await this.upsertDemoUser('seoyeon', 'MODEL', hash);
    let minho = await this.upsertDemoUser('minho', 'MODEL', hash);

    if ((await this.profiles.count()) === 0) {
    await this.profiles.save([
      this.profiles.create({
        userId: seoyeon.id,
        name: '김서연',
        age: 24,
        height: 168,
        category: ['패션', '뷰티'],
        region: '서울',
        price: '300,000원+',
        rating: 4.9,
        reviewCount: 124,
        images: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
        ],
        style: '미니멀',
        description:
          '미니멀 패션과 클린 뷰티 컨셉 전문 모델입니다. 커머셜 촬영 분야에서 5년의 경력을 보유하고 있습니다.',
      }),
      this.profiles.create({
        userId: minho.id,
        name: '이민호',
        age: 27,
        height: 185,
        category: ['스포츠', '커머셜'],
        region: '경기',
        price: '500,000원+',
        rating: 4.8,
        reviewCount: 89,
        images: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?auto=format&fit=crop&q=80&w=800',
        ],
        style: '애슬레틱',
        description:
          '피트니스 및 라이프스타일 브랜드에 최적화된 스포츠 모델입니다.',
      }),
    ]);
    }

    await this.ensureModelProfiles();

    await this.seedCampaignsIfMissing(advertiser, seoyeon);

    this.log.log(
      `시드 완료 — 광고주 nike_adv / 모델 seoyeon, minho (비밀번호: ${SEED_PASSWORD})`,
    );
  }

  private async upsertDemoUser(
    username: string,
    role: 'ADVERTISER' | 'MODEL',
    passwordHash: string,
  ): Promise<User> {
    let user = await this.users.findOne({ where: { username } });
    if (!user) {
      return this.users.save(
        this.users.create({ username, passwordHash, role }),
      );
    }
    user.passwordHash = passwordHash;
    return this.users.save(user);
  }

  private async ensureModelProfiles() {
    const models = await this.users.find({ where: { role: 'MODEL' } });
    for (const m of models) {
      const exists = await this.profiles.findOne({ where: { userId: m.id } });
      if (exists) continue;
      await this.profiles.save(
        this.profiles.create({
          userId: m.id,
          name: m.username,
          age: 24,
          height: 170,
          category: ['패션'],
          region: '서울',
          price: '협의',
          rating: 4.5,
          reviewCount: 0,
          images: [
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.username)}`,
          ],
          style: '미니멀',
          description: '',
        }),
      );
    }
  }

  private async seedCampaignsIfMissing(
    advertiser?: User,
    seoyeon?: User,
  ) {
    if ((await this.campaigns.count()) > 0) return;

    const adv =
      advertiser ??
      (await this.users.findOne({
        where: { role: 'ADVERTISER' },
        order: { id: 'ASC' },
      }));
    if (!adv) return;

    const model =
      seoyeon ??
      (await this.users.findOne({
        where: { role: 'MODEL' },
        order: { id: 'ASC' },
      }));

    const campaign = await this.campaigns.save(
      this.campaigns.create({
        advertiserId: String(adv.id),
        title: '여름 러닝 컬렉션',
        brand: '나이키',
        budget: '5,000,000원',
        requirements: '야외 촬영이 가능한 스포티한 모델을 찾습니다.',
        goals: '새로운 여름 컬렉션의 브랜드 인지도 향상.',
        contentStyle: '역동적이고 에너지가 넘치는 야외 도심 배경.',
        brandGuidelines: '진정성 있고 퍼포먼스 중심적인 느낌. 미니멀한 배경 선호.',
        productDetails: '새로운 통기성 메쉬 러닝화 및 경량 의류.',
        benefits: '교통비 지원, 전문 포토그래퍼의 포트폴리오 컷 제공.',
        status: 'OPEN',
        type: '커머셜',
      }),
    );

    if (model && (await this.offers.count()) === 0) {
      await this.offers.save(
        this.offers.create({
          campaignId: campaign.id,
          advertiserId: String(adv.id),
          modelId: String(model.id),
          price: '400,000원',
          status: 'PENDING',
        }),
      );
    }
  }

  /** 환영 채팅용 첫 번째 모델 사용자 ID */
  async getDefaultModelUserId(): Promise<string | null> {
    const model = await this.users.findOne({
      where: { role: 'MODEL' },
      order: { id: 'ASC' },
    });
    return model ? String(model.id) : null;
  }
}
