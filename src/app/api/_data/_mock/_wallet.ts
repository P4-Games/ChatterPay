import { IBalance, ITransaction } from 'src/types/wallet'

import { _mock } from './_mock'

export const _balances: IBalance[] = [
  {
    network: 'sepolia',
    balance: 23432.03,
    token: 'USDC',
    balance_conv: {
      usd: 1,
      ars: 1,
      brl: 1,
      uyu: 1
    }
  },
  {
    network: 'sepolia',
    balance: 1.5,
    token: 'ETH',
    balance_conv: {
      usd: 1,
      ars: 1,
      brl: 1,
      uyu: 1
    }
  },
  {
    network: 'sepolia',
    balance: 1,
    token: 'BTC',
    balance_conv: {
      usd: 1,
      ars: 1,
      brl: 1,
      uyu: 1
    }
  }
]

export const _transactions: ITransaction[] = [
  {
    id: _mock.id(2),
    trx_hash: '0x469c61b085335276861a90a7dc6809c6144317f9a811c95c923a1b3b35d85c29',
    wallet_from: '0x35dad65F60c1A32c9895BE97f6bcE57D32792E83',
    contact_from_phone: '5491153475555',
    contact_from_name: _mock.fullName(2),
    contact_from_avatar_url: _mock.fullName(2),
    wallet_to: '0x117b706DEF40310eF5926aB57868dAcf46605b8d',
    contact_to_phone: '5491131997779',
    contact_to_name: _mock.fullName(10),
    contact_to_avatar_url: _mock.image.avatar(10),
    type: 'transfer',
    date: _mock.time(2),
    status: 'completed',
    amount: _mock.number.price(2),
    token: 'USDC'
  },
  {
    id: _mock.id(3),
    trx_hash: '0x5832143b88fcd1727760bc656ee61219f74a1329eee401f2f9afc2e4802a0974',
    wallet_from: '0x117b706DEF40310eF5926aB57868dAcf46605b8d',
    contact_from_phone: '5491131997779',
    contact_from_name: _mock.fullName(10),
    contact_from_avatar_url: _mock.fullName(10),
    wallet_to: '0x35dad65F60c1A32c9895BE97f6bcE57D32792E83',
    contact_to_phone: '5491153475555',
    contact_to_name: _mock.fullName(3),
    contact_to_avatar_url: _mock.image.avatar(3),
    type: 'transfer',

    date: _mock.time(3),
    status: 'completed',
    amount: _mock.number.price(3),
    token: 'USDC'
  },
  {
    id: _mock.id(4),
    wallet_from: '0x35dad65F60c1A32c9895BE97f6bcE57D32792E83',
    trx_hash: '0x3eb9d217ff24604ad149c61487dd166296982849eb87d9992988f21ee22fdc17',
    contact_from_phone: '5491153475555',
    contact_from_name: _mock.fullName(4),
    contact_from_avatar_url: _mock.fullName(4),
    wallet_to: '0x117b706DEF40310eF5926aB57868dAcf46605b8d',
    contact_to_phone: '5491131997779',
    contact_to_name: _mock.fullName(10),
    contact_to_avatar_url: _mock.image.avatar(10),
    type: 'transfer',

    date: _mock.time(4),
    status: 'failed',
    amount: _mock.number.price(4),
    token: 'USDC'
  },
  {
    id: _mock.id(5),
    trx_hash: '0x4f6c005226909336066dd8f199bb0e0346175e53e1a53c50231b2395ba770b67',
    wallet_from: '0x117b706DEF40310eF5926aB57868dAcf46605b8d',
    contact_from_phone: '5491131997779',
    contact_from_name: _mock.fullName(10),
    contact_from_avatar_url: _mock.fullName(10),
    wallet_to: '0x35dad65F60c1A32c9895BE97f6bcE57D32792E83',
    contact_to_phone: '5491153475555',
    contact_to_name: _mock.fullName(5),
    contact_to_avatar_url: _mock.image.avatar(5),
    type: 'transfer',

    date: _mock.time(5),
    status: 'completed',
    amount: _mock.number.price(5),
    token: 'USDC'
  },
  {
    id: _mock.id(6),
    trx_hash: '0x1fb00e771fdac89017694d22504a45568785c903c568fa6ffb40641f9ea59a2f',
    wallet_from: '0x117b706DEF40310eF5926aB57868dAcf46605b8d',
    contact_from_phone: '5491131997779',
    contact_from_name: _mock.fullName(10),
    contact_from_avatar_url: _mock.fullName(10),
    wallet_to: '0x35dad65F60c1A32c9895BE97f6bcE57D32792E83',
    contact_to_phone: '5491153475555',
    contact_to_name: _mock.fullName(6),
    contact_to_avatar_url: _mock.image.avatar(6),
    type: 'transfer',
    date: _mock.time(6),
    status: 'failed',
    amount: _mock.number.price(6),
    token: 'USDC'
  }
]
