import { sub } from 'date-fns'

import {
  _id,
  _ages,
  _prices,
  _emails,
  _ratings,
  _nativeS,
  _nativeM,
  _nativeL,
  _percents,
  _booleans,
  _sentences,
  _lastNames,
  _fullNames,
  _firstNames,
  _descriptions,
  _phoneNumbers
} from './assets'

// ----------------------------------------------------------------------

export const _mock = {
  id: (index: number) => _id[index],
  time: (index: number) => sub(new Date(), { days: index, hours: index }),
  boolean: (index: number) => _booleans[index],
  // role: (index: number) => _roles[index],
  // Text
  // taskNames: (index: number) => _taskNames[index],
  // postTitle: (index: number) => _postTitles[index],
  // jobTitle: (index: number) => _jobTitles[index],
  // tourName: (index: number) => _tourNames[index],
  // productName: (index: number) => _productNames[index],
  sentence: (index: number) => _sentences[index],
  description: (index: number) => _descriptions[index],
  // Contact
  email: (index: number) => _emails[index],
  phoneNumber: (index: number) => _phoneNumbers[index],
  // fullAddress: (index: number) => _fullAddress[index],
  // Name
  firstName: (index: number) => _firstNames[index],
  lastName: (index: number) => _lastNames[index],
  fullName: (index: number) => _fullNames[index],
  // companyName: (index: number) => _companyNames[index],
  // Number
  number: {
    percent: (index: number) => _percents[index],
    rating: (index: number) => _ratings[index],
    age: (index: number) => _ages[index],
    price: (index: number) => _prices[index],
    nativeS: (index: number) => _nativeS[index],
    nativeM: (index: number) => _nativeM[index],
    nativeL: (index: number) => _nativeL[index]
  },
  // Image
  image: {
    cover: (index: number) => `/assets/images/cover_1.jpg`,
    avatar: (index: number) => `/assets/images/avatars/avatar_${index + 1}.jpg`,
    travel: (index: number) => `/assets/images/travel_1.jpg`,
    company: (index: number) => `/assets/images/company_1.png`,
    product: (index: number) => `/assets/images/product_1.jpg`,
    portrait: (index: number) => `/assets/images/portrait_1.jpg`
  }
}
