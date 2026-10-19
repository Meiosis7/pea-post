(function (root, factory) {
  const missions = factory();
  if (typeof module === 'object' && module.exports) module.exports = missions;
  else root.ExtraMissions = missions;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return [
    {
      title:'把彼此缺少的，寄给对方',short:'互补的两封信',topic:'纯合亲本的互补',icon:'✉',from:'南北两座种子仓',
      copy:'南仓只有黄色皱粒，北仓只有绿色圆粒。管理员不想买新种子：能否让这两种纯合亲本的孩子，同时拥有黄色和圆粒？',
      goal:'后代全部为 YyRr',condition:'一株黄色皱粒纯合亲本，与一株绿色圆粒纯合亲本杂交。',target:'黄色圆粒',p:1,family:2,
      check:(a,b,d)=>[a,b].includes('YYrr')&&[a,b].includes('yyRR')&&d.genotypes.YyRr===1,
      hint:'纯合亲本只产生一种配子。黄色皱粒给出 Yr；绿色圆粒给出 yR。把两个信封合在一起看看。',
      insight:'互补的纯合亲本 YYrr 与 yyRR 分别提供 Yr、yR，后代可全部成为 YyRr。后代的显性性状可以分别来自不同亲本；显性等位基因不必原本就在同一株上。'
    },
    {
      title:'绿色圆粒的三张入场券',short:'十六格里的三格',topic:'双因子概率相乘',icon:'♣',from:'雨后的小剧场',
      copy:'剧场用绿色圆粒种子做入场券。希望这种种子占全部后代的十六分之三，让一种颜色与另一种形状一起决定名额。',
      goal:'绿色圆粒的理论比例为 3/16',condition:'两对基因独立遗传；同时考虑绿色与圆粒。',target:'绿色圆粒',p:3/16,family:2,
      check:(a,b,d)=>d.phenotypes['绿色圆粒']===3/16,
      hint:'绿色必须是 yy，圆粒却可以是 RR 或 Rr。先找出使这两个事件概率分别为 1/4 和 3/4 的组合。',
      insight:'在 YyRr 自交中，绿色 yy 的概率为 1/4，圆粒 R_ 的概率为 3/4。两对基因独立遗传时，两者同时出现的概率为 3/16；不能把圆粒只算成 RR。'
    },
    {
      title:'八分之一的折皮信封',short:'八分之一的配方',topic:'不对称亲本组合',icon:'◇',from:'折纸工坊',
      copy:'工坊想用绿色皱粒做信封上的封印。这次不要十六分之一：请让它出现的机会翻一倍，同时保留两株亲本中的黄色秘密。',
      goal:'绿色皱粒的理论比例为 1/8',condition:'两株亲本在颜色基因上都必须是 Yy。',target:'绿色皱粒',p:1/8,family:2,
      check:(a,b,d)=>a.startsWith('Yy')&&b.startsWith('Yy')&&d.phenotypes['绿色皱粒']===1/8,
      hint:'Yy × Yy 让绿色占 1/4。要得到 1/8，皱粒应占多少？Rr 与哪种形状基因型搭配能做到？',
      insight:'YyRr 与 Yyrr 杂交时，yy 的概率为 1/4，rr 的概率为 1/2，故 yyrr 为 1/8。亲本不必相同，仍可分开分析每一对等位基因，再组合概率。'
    },
    {
      title:'只收皱粒的邮票展',short:'黄色皱粒占一半',topic:'限定性状的测交',icon:'▧',from:'旧邮票收藏馆',
      copy:'收藏馆的底纸只适合皱粒种子。请让所有后代都保持皱粒，其中黄色与绿色机会均等；馆里指定一株绿色皱粒做亲本。',
      goal:'后代全部皱粒，黄色皱粒占 1/2',condition:'必须使用 yyrr 作为一个亲本。',target:'黄色皱粒',p:.5,family:2,
      check:(a,b,d)=>[a,b].includes('yyrr')&&d.phenotypes['黄色皱粒']===.5&&(d.phenotypes['绿色皱粒']||0)===.5,
      hint:'想让所有后代都是 rr，两个亲本都只能给 r。再用 Yy 与 yy 搭配，决定颜色的一半一半。',
      insight:'Yyrr × yyrr 中，形状基因固定为 rr；只有颜色基因发生分离，后代 Yyrr 与 yyrr 各占 1/2。一次双因子杂交也可能只有一对性状发生分离。'
    },
    {
      title:'同样的绿色，不同的标签',short:'看得见与看不见',topic:'区分基因型与表现型',icon:'◑',from:'植物档案室',
      copy:'档案员提出两个要求：绿色圆粒要占四分之三，而标签写着 yyRr 的种子要占一半。两个比例看起来不同，能同时实现吗？',
      goal:'yyRr 占 1/2，绿色圆粒占 3/4',condition:'全部后代必须为绿色。预测栏填写表现型比例。',target:'绿色圆粒',p:.75,family:2,
      check:(a,b,d)=>d.genotypes.yyRr===.5&&d.phenotypes['绿色圆粒']===.75&&(d.phenotypes['绿色皱粒']||0)===.25,
      hint:'绿色圆粒不只有 yyRr，也包括 yyRR。让颜色固定为 yy，再找出形状基因型为 1∶2∶1 的组合。',
      insight:'yyRr × yyRr 的后代 yyRR、yyRr、yyrr 为 1∶2∶1。因此 yyRr 占 1/2，而绿色圆粒要把 yyRR 与 yyRr 相加，得到 3/4。基因型概率与表现型概率不能直接互换。'
    },
    {
      title:'一模一样的四种秘密',short:'全显性，四种标签',topic:'相同表现型中的遗传差异',icon:'✥',from:'双胞胎的种子铺',
      copy:'两位店主想要一批外表全是黄色圆粒的种子，但不能只有一种遗传标签。请让双杂合子恰好占四分之一，藏在相同的外表下面。',
      goal:'全部黄色圆粒，其中 YyRr 占 1/4',condition:'预测栏填写黄色圆粒的比例，而不是 YyRr 的比例。',target:'黄色圆粒',p:1,family:2,
      check:(a,b,d)=>d.phenotypes['黄色圆粒']===1&&d.genotypes.YyRr===.25,
      hint:'在颜色这对基因上，让纯合显性与杂合相遇；形状也这样做，但把两个纯合显性安排在不同亲本中。',
      insight:'YYRr × YyRR 可产生 YYRR、YYRr、YyRR、YyRr 四种等概率基因型，外表却都为黄色圆粒。外表一致并不意味着基因型一致，也不意味着后代会稳定遗传。'
    },
    {
      title:'两条路，都能寄到',short:'八分之三的岔路',topic:'寻找多种可行解',icon:'⑂',from:'山路岔口的邮差',
      copy:'邮差带着一株 YyRr，在两个方向之间犹豫。请找一位伙伴，让黄色圆粒占八分之三。这封信有不止一种正确的寄法。',
      goal:'黄色圆粒的理论比例为 3/8',condition:'至少一株亲本必须为 YyRr。',target:'黄色圆粒',p:3/8,family:2,
      check:(a,b,d)=>[a,b].includes('YyRr')&&d.phenotypes['黄色圆粒']===3/8,
      hint:'3/8 可以是 3/4 × 1/2，也可以是 1/2 × 3/4。让颜色与形状轮流承担那一半概率。',
      insight:'YyRr 与 Yyrr 或 yyRr 杂交，黄色圆粒的概率都为 3/8，分别来自 3/4 × 1/2 与 1/2 × 3/4。目标表现型比例相同，整批后代的其他性状分布仍可能不同。'
    },
    {
      title:'给下一代留一扇窗',short:'毕业前的双标签',topic:'兼顾外观与遗传潜力',icon:'❦',from:'未来的种子守护人',
      copy:'最后一批种子都要绿色圆粒。一半标签必须是 yyRR，另一半必须是 yyRr：既保留稳定的形状，也为下一代留下变化的可能。',
      goal:'yyRR 与 yyRr 各占 1/2',condition:'全部后代绿色圆粒；预测栏填写表现型比例。',target:'绿色圆粒',p:1,family:2,
      check:(a,b,d)=>d.genotypes.yyRR===.5&&d.genotypes.yyRr===.5&&d.phenotypes['绿色圆粒']===1,
      hint:'两边都只能提供 y。形状这对基因中，一边只给 R，另一边等概率给 R 或 r。',
      insight:'yyRR × yyRr 的后代全为绿色圆粒，但 yyRR 与 yyRr 各占 1/2。单独自交时，前者的形状可稳定遗传，后者的形状会分离；这解释了为什么育种不能只看外表。'
    }
  ];
});
