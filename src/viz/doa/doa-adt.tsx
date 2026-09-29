import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './doa-adt.css'

/* Lecture02.pdf s. 46 (definitionen + List<T> med headInsert, headRemove, insert, remove,
   length, clear, at), s. 47 (VectorList med -vector<T> myList og «library» std::Vector,
   LinkedList med -Node<T> root og Node{value, next}, DoublyLinkedList med -DllNode<T> root
   og DllNode{value, next, prev}; stiplet pil med hul trekant til List), s. 51 (målet:
   skjul implementeringen for klienten), s. 52 (Method 1: Use inheritance — Point med pure
   virtual distance/getX/getY, PointImpl : public Point med private float x, y) og s. 53
   (Method 2: Use abstract classes, “method preferred by the book” — én klasse Point med
   private float x, y). Klientens kald er slidets egne operationsnavne.
   Indhold: src/content/doa/p2-lineaere.ts (adt). */

const OPS = [
  '+headInsert(const T& x)',
  '+headRemove()',
  '+insert(const T& data, unsigned int index)',
  '+remove(unsigned int index)',
  '+length(): unsigned int',
  '+clear()',
  '+at(unsigned int i): T',
]

interface Impl {
  name: ReactNode
  field: string
  helper: ReactNode
  at: number
}

const IMPLS: Impl[] = [
  { name: 'VectorList', field: '-vector<T> myList', helper: <>«library» std::Vector</>, at: 2 },
  { name: 'LinkedList', field: '-Node<T> root', helper: <>Node: value, next</>, at: 3 },
  {
    name: (
      <>
        Doubly&shy;Linked&shy;List
      </>
    ),
    field: '-DllNode<T> root',
    helper: <>DllNode: value, next, prev</>,
    at: 4,
  },
]

const METHODS_AT = 5
const LAST = 6

function Arrow() {
  return (
    <div className="dadt-use" aria-hidden="true">
      <svg className="dadt-use-h" viewBox="0 0 60 14">
        <path d="M2 7 H56" />
        <path d="M49 2 L57 7 L49 12" className="is-head" />
      </svg>
      <svg className="dadt-use-v" viewBox="0 0 14 34">
        <path d="M7 2 V30" />
        <path d="M2 23 L7 31 L12 23" className="is-head" />
      </svg>
      <span className="dadt-use-label">bruger</span>
    </div>
  )
}

function Adt({ step }: { step: number }) {
  const active = step >= 2 && step <= 4 ? step - 2 : -1
  const realOn = step >= 2
  return (
    <div className="dadt">
      <div className="dadt-top">
        <motion.div
          className="dadt-client"
          data-now={step === 1 || step === 3 || undefined}
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0.3 }}
          transition={step >= 1 ? t.settle : t.fade}
        >
          <span className="vcaps">Klient</span>
          <code>List&lt;T&gt;&amp; l</code>
          <code>l.headInsert(x);</code>
          <code>l.at(i);</code>
          <span className="dadt-tag">
            <Tag show={step >= 3} tone="ok">
              samme kald
            </Tag>
          </span>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          transition={step >= 1 ? t.settle : t.fade}
          className="dadt-usewrap"
        >
          <Arrow />
        </motion.div>

        <div className="dadt-right">
          <div className="dadt-iface" data-now={step === 0 || undefined}>
            <div className="dadt-head">
              <span className="dadt-name">
                List<span className="dadt-t">T</span>
              </span>
            </div>
            <ul className="dadt-ops">
              {OPS.map((o) => (
                <li key={o}>
                  <code>{o}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="dadt-real" aria-hidden="true">
            <motion.svg
              className="dadt-tri"
              viewBox="0 0 16 12"
              initial={false}
              animate={{ opacity: realOn ? 1 : 0.3 }}
              transition={t.fade}
            >
              <path d="M8 1 L15 11 L1 11 Z" />
            </motion.svg>
            <motion.div className="dadt-stem" initial={false} animate={{ opacity: realOn ? 1 : 0.3 }} transition={t.fade} />
            <motion.div className="dadt-bar" initial={false} animate={{ opacity: realOn ? 1 : 0.3 }} transition={t.fade} />
          </div>

          <div className="dadt-impls">
            {IMPLS.map((m, i) => {
              const on = step >= m.at
              return (
                <motion.div
                  key={m.field}
                  className="dadt-impl"
                  data-on={on || undefined}
                  data-now={active === i || undefined}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.3 }}
                  transition={on ? t.place : t.fade}
                >
                  <span className="dadt-drop" aria-hidden="true" />
                  <span className="dadt-iname">{m.name}</span>
                  <code className="dadt-field">{m.field}</code>
                  <span className="dadt-helper">{m.helper}</span>
                </motion.div>
              )
            })}
          </div>
          <p className="dadt-same">Alle tre har præcis de samme syv offentlige operationer.</p>
        </div>
      </div>

      <motion.div
        className="dadt-methods"
        initial={false}
        animate={{ opacity: step >= METHODS_AT ? 1 : 0 }}
        transition={step >= METHODS_AT ? t.settle : t.fade}
      >
        <div className="dadt-method" data-now={step === LAST || undefined}>
          <span className="vcaps">Method 1: Use inheritance · s. 52</span>
          <pre>
            {['class Point {', 'public:', '  virtual float distance(Point& a) = 0;', '  virtual float getX() = 0;', '  virtual float getY() = 0;', '};', 'class PointImpl : public Point {', 'private:', '  float x, y;  …', '};'].map((l, i) => (
              <code key={i}>{l}</code>
            ))}
          </pre>
          <span className="dadt-verdict">
            Rent interface + arvende klasser: <strong>flere implementeringer</strong>, brugt via <code>Point&amp;</code>.
          </span>
        </div>
        <div className="dadt-method">
          <span className="vcaps">Method 2: Use abstract classes · s. 53</span>
          <pre>
            {['class Point {', 'private:', '  float x, y;', 'public:', '  Point();', '  ~Point();', '  float distance(Point a);', '};'].map((l, i) => (
              <code key={i}>{l}</code>
            ))}
          </pre>
          <span className="dadt-verdict">
            Én klasse, private data og offentlige metoder: <strong>én implementering</strong>. Bogens foretrukne.
          </span>
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-adt',
  title: 'Ét interface, tre implementeringer',
  steps: [
    {
      caption:
        'En **ADT** er værdier, der kun kan tilgås gennem et interface. Slidets `List<T>` fastlægger syv operationer — hvad, ikke hvordan.',
      hold: 2600,
    },
    { caption: 'Klienten kender kun interfacet og kalder operationerne på en `List<T>&`.', hold: 2000 },
    {
      caption: '`VectorList` realiserer interfacet (stiplet pil, hul trekant). Bag facaden ligger en `vector<T> myList`.',
      hold: 2400,
    },
    {
      caption: '`LinkedList` realiserer samme interface med en kæde af `Node`’er. Klientens kald er **uændrede**.',
      hold: 2400,
    },
    {
      caption: '`DoublyLinkedList` med `next` og `prev`. Implementeringen kan skiftes, uden at klientkoden ændres.',
      hold: 2400,
    },
    {
      caption:
        'To måder i C++. *Method 1*: et rent virtuelt `Point` og en `PointImpl`, der arver. *Method 2*: én klasse med private data.',
      hold: 3000,
    },
    {
      caption:
        'List-diagrammet er *Method 1*: interface + arv giver plads til flere implementeringer. *Method 2* giver kun én. Målet er det samme — skjul implementeringen for klienten.',
      hold: 3000,
    },
  ],
  Component: Adt,
}

export default viz
