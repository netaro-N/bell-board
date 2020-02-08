'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const deleteFixture = require('../routes/manage').deleteFixture;

describe('"/login" Routerオブジェクトのテスト', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログインのためのリンクが含まれる', (done) => {
    request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/github"/)
      .expect(200, done);
  });

  it('ログイン時はユーザー名が表示される', (done) => {
    request(app)
      .get('/')
      .expect(/testuser/)
      .expect(200, done);
  });

});

describe('"/logout" Routerオブジェクトのテスト', () => {
  it('/にリダイレクトされる', (done) => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done)
  });
});

describe('"/manage" のテスト', () => {
  it('試合が作成でき、表示される', (done) => {
    request(app)
      .post('/manage/new')
      //fixtureId,fixtureDate,description,homeTeam,awayTeam,homeScore,awayScore
      .send({  })
      .expect('Location',/manage/new) //⇐get の方の"manage/new"
      .expect(302)
      .end((err, res) => {
        const testFixtureId = hoge;
        request(app)
          .get(testFixtureId)
          //TODO 作成された試合と結果が表示されていることをテスト

          .expect(200)
          .end((err, res) => { deleteFixture(testFixtureId, done, err); });//作成した試合を削除
      });
  });
});