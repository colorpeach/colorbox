define(['js/app', 'js/common', 'angular-mocks'], function(app) {

    describe('应用启动', function() {

        it('应用初始化', function() {
            expect(app).toBeDefined();
        });

    });

    describe('DataList测试', function() {
        var DataList;
        var dataList;

        beforeEach(module('index'));

        beforeEach(inject( function(_DataList_){
            DataList = _DataList_;
        }));

        it('初始化DataList对象', function(){
            dataList = new DataList({name: 'String', number: 'Number', date: 'Date'});

            expect(dataList).toBeDefined();
        });

        it('设置DataList数据', function(){
            dataList.add({name: 'first', number: 1, date: new Date});
            expect(dataList.get(0).name).toBe('first');
        });

        //it('设置DataList数据类型', function(){
        //    expect(dataList.add({name: 1})).toThrowError('字段：name类型错误');
        //});

    });

});