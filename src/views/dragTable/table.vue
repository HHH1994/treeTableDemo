<!-- 可拖拽表格 -->
<template>
  <div>
    <p>拖拽表格</p>
    <el-table
      ref="dragTable"
      row-key="id"
      :data="treeTableData"
      :expand-row-keys="treeTableExpandKeys"
      border
      @expand-change="treeTableExpandChange"
    >
      <el-table-column prop="name" label="名字"></el-table-column>
      <el-table-column prop="age" label="年龄"></el-table-column>
      <el-table-column prop="desc" label="描述"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import Sortable from "sortablejs";
export default {
  data() {
    return {
      treeTableData: [
        {
          id: '1',
          name: "a",
          age: 11,
          desc: "喝喝",
          children: [
            {
              id: '2',
              name: "b",
              age: 15,
              desc: "嘻嘻",
            },
          ],
        },
        {
          id: '3',
          name: "c",
          age: 18,
          desc: "哈哈",
          children: [
            {
              id: '4',
              name: "d",
              age: 25,
              desc: "嘿嘿",
            },
          ],
        },
      ],
      flatTreeData: [],
      treeTableExpandKeys: [],
      sortableObj: null,
    };
  },
  mounted() {
    this.transverseNode(this.treeTableData, 1, (node, level, parentNode) => {
      node.level = level;
      node.parentId = parentNode ? parentNode.id : -1;
    });
    this.initSortable();
    this.getFlatNode(this.treeTableData, this.flatTreeData);
  },
  beforeDestroy() {
    if (this.sortableObj) {
      this.sortableObj.destroy();
    }
  },
  methods: {
    initSortable() {
      // 获取容器元素
      const el = this.$refs.dragTable.$el.querySelectorAll(
        ".el-table__body-wrapper > table > tbody"
      )[0];

      if (!el) return;

      this.sortableObj = new Sortable(el, {
        group: "dragName",
        draggable: ".el-table__row",
        onEnd: (evt) => {
          const { newIndex, oldIndex } = evt;
          const dragRow = this.flatTreeData[oldIndex];
          const relatedRow = this.flatTreeData[newIndex];
          if (dragRow.parentId !== relatedRow.parentId) {
            this.$message.warning("只能同层级内排序");
            this.reRender(null, "treeTableData");
          } else {
            // 都无children
            if (!dragRow.children && !relatedRow.children) {
              const oldData = this.flatTreeData.splice(oldIndex, 1)[0];
              this.flatTreeData.splice(newIndex, 0, oldData);
            }

            // drag有, relate无
            if (dragRow.children && !relatedRow.children) {
              const oldData = this.flatTreeData.splice(oldIndex, 1)[0];
              this.flatTreeData.splice(newIndex, 0, oldData);

              if (newIndex < oldIndex) {
                // 有子元素的，子元素需要同样跟上来
                const flatChildren = [];

                this.getFlatNode(oldData.children || [], flatChildren);
                if (flatChildren.length > 0) {
                  for (let i = 1, len = flatChildren.length; i <= len; i++) {
                    const childData = this.flatTreeData.splice(
                      oldIndex + i,
                      1
                    )[0];
                    this.flatTreeData.splice(newIndex + i, 0, childData);
                  }
                }
              } else {
                // 有子元素的，子元素需要同样跟下来
                const flatChildren = [];

                this.getFlatNode(oldData.children || [], flatChildren);
                if (flatChildren.length > 0) {
                  for (let i = 1, len = flatChildren.length; i <= len; i++) {
                    const childData = this.flatTreeData.splice(oldIndex, 1)[0];
                    this.flatTreeData.splice(newIndex, 0, childData);
                  }
                }
              }
            }

            // drag无, relate有
            if (!dragRow.children && relatedRow.children) {
              const oldData = this.flatTreeData.splice(oldIndex, 1)[0];
              this.flatTreeData.splice(newIndex, 0, oldData);

              if (newIndex > oldIndex) {
                // 有子元素的，子元素需要同样跟上来
                const flatChildren = [];

                this.getFlatNode(relatedRow.children || [], flatChildren);
                if (flatChildren.length > 0) {
                  for (let i = 1, len = flatChildren.length; i <= len; i++) {
                    const childData = this.flatTreeData.splice(
                      newIndex + i,
                      1
                    )[0];
                    this.flatTreeData.splice(newIndex + i - 1, 0, childData);
                  }
                }
              }
            }

            // drag有, relate有
            if (dragRow.children && relatedRow.children) {
              if (newIndex < oldIndex) {
                const oldData = this.flatTreeData.splice(oldIndex, 1)[0];
                this.flatTreeData.splice(newIndex, 0, oldData);

                // 有子元素的，子元素需要同样跟上来
                const flatChildren = [];

                this.getFlatNode(oldData.children || [], flatChildren);
                if (flatChildren.length > 0) {
                  for (let i = 1, len = flatChildren.length; i <= len; i++) {
                    const childData = this.flatTreeData.splice(
                      oldIndex + i,
                      1
                    )[0];
                    this.flatTreeData.splice(newIndex + i, 0, childData);
                  }
                }
              } else {
                const oldData = this.flatTreeData.splice(oldIndex, 1)[0];

                // relateRow的children数
                const relateFlatChildren = [];
                this.getFlatNode(relatedRow.children || [], relateFlatChildren);

                this.flatTreeData.splice(
                  newIndex + relateFlatChildren.length,
                  0,
                  oldData
                );

                // 有子元素的，子元素需要同样跟下来
                const flatChildren = [];

                this.getFlatNode(oldData.children || [], flatChildren);
                if (flatChildren.length > 0) {
                  for (let i = 1, len = flatChildren.length; i <= len; i++) {
                    const childData = this.flatTreeData.splice(oldIndex, 1)[0];
                    this.flatTreeData.splice(
                      newIndex + relateFlatChildren.length,
                      0,
                      childData
                    );
                  }
                }
              }
            }

            // 重新生成树的数据
            const data = this.getTreeData(this.flatTreeData, []);
            console.log("this.flatTreeData", this.flatTreeData, data);
            // 页面重新渲染
            this.reRender(data, "treeTableData");
          }
        },
      });
    },
    getFlatNode(nodes, flatList, childrenKey = "children") {
      nodes.forEach((node) => {
        flatList.push(node);
        if (node[childrenKey] && node[childrenKey].length) {
          this.getFlatNode(node[childrenKey], flatList);
        }
      });
    },
    getTreeData(nodes, resultList) {
      const childStack = [];
      let lastNode = {};
      nodes.forEach((node) => {
        delete node.children;

        const pushNode = (dataNode) => {
          const parentNode = childStack[childStack.length - 1];
          if (parentNode) {
            parentNode.children.push(dataNode);
          } else {
            resultList.push(dataNode);
          }
        };

        if (node.level < lastNode.level) {
          childStack.length = node.level - 1;
          pushNode(node);
        } else if (node.level === lastNode.level) {
          pushNode(node);
        } else if (node.level > lastNode.level) {
          if (!lastNode.children) {
            lastNode.children = [];
          }
          childStack.push(lastNode);
          pushNode(node);
        } else {
          resultList.push(node);
        }

        lastNode = node;
      });

      return resultList;
    },
    reRender(data, dataKey) {
      if (data) {
        this[dataKey] = [];
        this.$nextTick(() => {
          this[dataKey] = data;
        });
      } else {
        const origin = [].concat(this[dataKey]);
        this[dataKey] = [];
        this.$nextTick(() => {
          this[dataKey] = origin;
        });
      }
    },
    transverseNode(nodes, level = 1, cb, parentNode, childKey = "children") {
      nodes.forEach((node) => {
        if (node[childKey] && node[childKey].length > 0) {
          this.transverseNode(node[childKey], level + 1, cb, node, childKey);
        }
        cb(node, level, parentNode);
      });
      return nodes;
    },
    treeTableExpandChange(row, expanded) {
      if (expanded) {
        this.treeTableExpandKeys.push(row.id);
      } else {
        const idx = this.treeTableExpandKeys.indexOf(row.id);
        this.treeTableExpandKeys.splice(idx, 1);
      }
    }
  },
};
</script>
<style lang="scss" scoped>
</style>