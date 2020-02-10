'use strict';
const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const passportStub = require('passport-stub');
const Fixture = require('../models/fixture');
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
      .send({ fixtureId:'hoge',fixtureDate:'2200/12/21 10:01',description:'hogeリーグ',location:'hogeスタ',homeTeam:'Realhoge',awayTeam:'FChoge' })
      .expect('Location', /manage/) //⇐get の方の"manage/new"
      .expect(302)
      .end((err, res) => {
        const testFixtureId = 'hoge1';
        request(app)
          .get(`/fixtures/${testFixtureId}`)
          //TODO 作成された試合と結果が表示されていることをテスト
          .expect(/2200/)
          .expect(/hogeリーグ/)
          .expect(/hogeスタ/)
          .expect(/Realhoge/)
          .expect(/FChoge/)
          .expect(200)
          .end((err, res) => { deleteFixture(testFixtureId, done, err); });//作成した試合を削除
      });
  });
});

describe('"/manage/:fixtureId?edit=1" のテスト', () => {
  it('試合が作成でき、編集できる', (done) => {
    request(app)
      .post('/manage/new')
      .send({ fixtureId:'huga',fixtureDate:'2200/12/21 10:01',description:'hogeリーグ',location:'hogeスタ',homeTeam:'Realhoge',awayTeam:'FChoge',homeScore:'3',awayScore:'2' })
      //.expect('Location', /manage/) //⇐get の方の"manage/new"
      //.expect(302)
      .end((err, res) => {
        const testEditFixtureId = 'huga1';
        request(app)
          .post(`/manage/${testEditFixtureId}?edit=1`)
          .send( { fixtureDate:'2220/12/21 10:01',description:'hugaリーグ',location:'hugaスタ',homeTeam:'Realhuga',awayTeam:'FChuga',homeScore:'3',awayScore:'2' } )
            .end((err, res) => {
              Fixture.findByPk(testEditFixtureId).then((f) => {
                assert.equal(f.description, 'hugaリーグ');
                deleteFixture(testEditFixtureId, done, err);
              });
            });
          // .get(`/fixtures/${testFixtureId}`)
          // //TODO 作成された試合と結果が表示されていることをテスト
          // .expect(/2200/)
          // .expect(/hogeリーグ/)
          // .expect(/hogeスタ/)
          // .expect(/Realhoge/)
          // .expect(/FChoge/)
          // .expect(200)
          //.end((err, res) => { deleteFixture(testFixtureId, done, err); });//作成した試合を削除
      });
  });
});

