/*jshint esversion: 6 */

import router from '../../modules/router';

const getHashCases = [
  [
    "",
    [{
        action: undefined,
        category: undefined,
        page: undefined
      },
      new URLSearchParams()
    ]
  ],
  [
    "#menu",
    [{
        action: 'menu',
        category: undefined,
        page: undefined
      },
      new URLSearchParams()
    ]
  ],
  [
    "#menu/rgb",
    [{
        action: 'menu',
        category: 'rgb',
        page: undefined
      },
      new URLSearchParams()
    ],
  ],
  [
    "#run/rgb/whats-red-green-blue",
    [{
        action: 'run',
        category: 'rgb',
        page: 'whats-red-green-blue'
      },
      new URLSearchParams()
    ],
  ],
  [
    "#menu?dev=1",
    [{
        action: 'menu',
        category: undefined,
        page: undefined
      },
      new URLSearchParams('dev=1'),
    ]
  ],
  [
    "#menu/rgb?dev=1",
    [{
        action: 'menu',
        category: 'rgb',
        page: undefined
      },
      new URLSearchParams('dev=1'),
    ]
  ],
  [
    "#run/rgb/whats-red-green-blue?dev=1",
    [{
        action: 'run',
        category: 'rgb',
        page: 'whats-red-green-blue'
      },
      new URLSearchParams('dev=1')
    ],
  ]
];

test.each(getHashCases)(
  '%#. router.getHash(%s)', (hash, expected) => {
    expect(router.getHash(hash)).toMatchObject(expected);
  }
);
