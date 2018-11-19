import { ModelOneOutput } from './src/app/genetic/model-one-output';
import { ModelTwoOutput } from './src/app/genetic/model-two-output';
import { Robot } from './src/app/genetic/robot.model';
import { Trainer } from './src/app/genetic/trainer';

const train = async () => {
  const trainer = new Trainer(ModelOneOutput, 24);
  await trainer.preLoad();

  await trainer.iterate(8, true);
};

export const robotSimpleDemo = async () => {
  const r1 = new Robot(ModelTwoOutput, 24, 18);

  let temp1 = 22;
  for (let index = 0; index < 2; index++) {
    temp1 = r1.guess(temp1);
  }

  console.warn('R1 Result', r1.result());
  console.warn('R1 Score', r1.score());
  console.warn('R1 Moves', r1.getMoves());

  console.warn('------');

  const r2 = new Robot(ModelTwoOutput, 21, 26);

  let temp2 = 23;
  for (let index = 0; index < 2; index++) {
    temp2 = r2.guess(temp2);
  }

  console.warn('R2 Result', r2.result());
  console.warn('R2 Score', r2.score());
  console.warn('R2 Moves', r2.getMoves());

  console.warn('------');

  const w1 = r1.getWeights();
};

export const robotDemo = async () => {
  const r1 = new Robot(ModelTwoOutput, 24, 18);
  const r2 = new Robot(ModelTwoOutput, 21, 26);

  let temp1 = 20;
  let temp2 = 24;
  for (let index = 0; index < 20; index++) {
    temp1 = r1.guess(temp1);
    temp2 = r2.guess(temp2);
  }

  console.warn(r1.score());
  console.warn(r2.score());

  const w1 = r1.getWeights();
  const w2 = r2.getWeights();

  // console.log(w1);

  const moves = [...r1.getMoves(), ...r2.getMoves()];

  console.log(moves);

  const rlast = new Robot(ModelTwoOutput, 24, 18);
  rlast.setWeights(w1, w2, r1.getWeights(), r2.getWeights());
  // await rlast.setMoves(moves);

  rlast.guess(20);
  rlast.guess(20);
  rlast.guess(20);
  rlast.guess(20);
  rlast.guess(20);
  rlast.guess(20);

  console.warn(rlast.score());

  console.warn(rlast.getMoves());
};

train().then(x => console.log('done', x));

// robotSimpleDemo().then(x => console.log("done", x));
// robotV2SimpleDemo().then((x) => console.log('done', x));
// robotDemo().then((x) => console.log('done', x));

// scoreTest();
