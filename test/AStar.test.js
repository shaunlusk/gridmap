var SL = SL || {};
var AStar = SL.AStar;
var AStarNode = SL.AStarNode;
var AStarPathProvider = SL.AStarPathProvider;

describe("AStarNode", function(){
  describe("#compareTo()", function(){
    it("should return -1 when this AStarNodes f() cost is less than another's.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      AStarNode1.f = 1;
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      AStarNode2.f = 2;
      assert(AStarNode1.compareTo(AStarNode2) === -1, "should return -1");
      done();
    });
    it("should return 0 when this AStarNodes f() cost is equal to another's.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      AStarNode1.f = 2;
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      AStarNode2.f = 2;
      assert(AStarNode1.compareTo(AStarNode2) === 0, "should return 0");
      done();
    });
    it("should return 1 when this AStarNodes f() cost is greater than another's.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      AStarNode1.f = 2;
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      AStarNode2.f = 1;
      assert(AStarNode1.compareTo(AStarNode2) === 1, "should return 1");
      done();
    });
  });
  describe("#equals()", function() {
    it("should return true when it is the same AStarNode.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      assert(AStarNode1.equals(AStarNode1) === true, "should return true");
      done();
    });
    it("should return true when the two AStarNode's elements match.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      assert(AStarNode1.equals(AStarNode2) === true, "should return true");
      done();
    });
    it("should return false when the two AStarNode's elements do not match.", function(done){
      var AStarNode1 = new AStarNode(getAStarElement(), null, 0);
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      AStarNode2.element.value = 5;
      assert(AStarNode1.equals(AStarNode2) === false, "should return false");
      done();
    });
    it("should throw an exception when \"equals()\" is not implemented by the element.", function(done){
      var AStarNode1 = new AStarNode("doesn't implement equals()", null, 0);
      var AStarNode2 = new AStarNode(getAStarElement(), null, 0);
      var threwException = throwsException(function () {
        AStarNode1.equals(AStarNode2);
      });
      assert( threwException === true, "should throw exception");
      done();
    });
  });
});
describe("AStar",function() {
  describe("#_getPath()",function(){
    it("should retrieve a correctly ordered path from a node with parents", function(done){
        var AStarNode1 = new AStarNode(getAStarElement(10), null, 0);
        AStarNode1 = new AStarNode(getAStarElement(9), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(8), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(7), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(6), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(5), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(4), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(3), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(2), AStarNode1, 0);
        AStarNode1 = new AStarNode(getAStarElement(1), AStarNode1, 0);

        var astar = new AStarPathProvider(null, null, 0, null, null);
        var list = astar._getPath(AStarNode1);

        assert( list[0].element.value === 10, "expected 10, got:" + list[0].element.value );
        assert( list[1].element.value === 9, "expected 9, got:" + list[1].element.value );
        assert( list[2].element.value === 8, "expected 8, got:" + list[2].element.value );
        assert( list[3].element.value === 7, "expected 7, got:" + list[3].element.value );
        assert( list[4].element.value === 6, "expected 6, got:" + list[4].element.value );
        assert( list[5].element.value === 5, "expected 5, got:" + list[5].element.value );
        assert( list[6].element.value === 4, "expected 4, got:" + list[6].element.value );
        assert( list[7].element.value === 3, "expected 3, got:" + list[7].element.value );
        assert( list[8].element.value === 2, "expected 2, got:" + list[8].element.value );
        assert( list[9].element.value === 1, "expected 1, got:" + list[9].element.value );
        done();
    });
  });
});

function getAStarElement(val) {
  if (val === undefined || val === null) val = 1;
  var element = {
    value : val
    ,equals:function(other) {
      return this.value === other.value;
    }
  };
  return element;
}
