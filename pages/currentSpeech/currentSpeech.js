// pages/currentSpeech/currentSpeech.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 从上页给的options传来的数据
    current_speechid: '',
    current_title: '',
    current_speaker: '',
    current_end_time: '',

    // 签到相关
    didMeSign: false,
    input_sicnuid: '',
    signedList: [],
    sicnuid_rules: [{
      required: true,
      min: 10,
      max: 12,
      message: '学号是10-12个数字！'
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options);
    this.setData({
      current_speechid: options.cur_speechid,
      current_end_time: options.cur_endtime,
      current_title: options.cur_title,
      current_speaker: options.cur_speaker,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.flushCurrentSignedList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 刷新当前进行中的展讲的 签到列表
   */
  flushCurrentSignedList: function() {
    wx.request({
      // url: 'http://localhost:9090/v1/weixin/speech/signedList/' + this.data.current_speechid,
      url: 'https://api.sicnurpz.online/v1/weixin/speech/signedList/' + this.data.current_speechid,
      method: 'GET',
      success: (res) => {
        if (wx.$ratelimitGuard(res.statusCode)) return;
        // console.log(res.data);
        res.data.bundle_data.result.forEach(item => {
          // （暂时不考虑同名同姓）如果签到表中有当前用户的名字则认为已经签到
          if (item.name == wx.getStorageSync("truename")) {
            this.setData({
              didMeSign: true
            });
          }
        });
        this.setData({
          signedList: res.data.bundle_data.result
        });
        wx.lin.showToast({
          title: '刷新签到表成功!',
          icon: 'success',
        });
      },
      fail: (err) => {
        console.log(err.errMsg);
        wx.lin.showToast({
          title: `刷新签到列表出错! `,
          icon: 'error',
          iconStyle: 'color: red; size: 60',
        });
      },
    })
  },

  /**
   * 提交签到请求
   */
  submitSign: function() {
    // 必须确保签到前填了学号
    if (this.data.input_sicnuid !== "") {
      wx.request({
        // url: 'http://localhost:9090/v1/weixin/speech/signIn',
        url: 'https://api.sicnurpz.online/v1/weixin/speech/signIn',
        method: 'POST',
        data: {
          speechid: this.data.current_speechid,
          name: wx.getStorageSync("truename"),
          sicnuid: this.data.input_sicnuid,
        },
        success: (res) => {
          if (res.statusCode === 429) {
            wx.lin.showToast({
              title: '请求太快啦！',
              icon: 'error',
              iconStyle: 'color: red; size: 60',
            });
            return;
          }
          console.log(res.data);
          if (res.statusCode < 300 && res.statusCode >= 200) {
            // console.log(err.errMsg);
            // 签到成功会返回当前的签到列表
            this.setData({
              didMeSign: true,
              signedList: res.data.bundle_data.result,
              input_sicnuid: '',
            });
            wx.lin.showToast({
              title: `签到成功!`,
              icon: 'success',
              iconStyle: 'color: cyan; size: 60',
            });
          } else if (res.statusCode === 406) {
            // 406 说明 POST 请求提交字段不完整
            wx.lin.showToast({
              title: `签到失败!提交数据不完整`,
              icon: 'error',
              iconStyle: 'color: red; size: 60',
            });
          }
        },
        fail: (err) => {
          console.log(err.errMsg);
          wx.lin.showToast({
            title: `签到出错! 原因: ${err.errMsg}`,
            icon: 'error',
            iconStyle: 'color: red; size: 60',
          });
        }
      });
    } else {
      wx.lin.showToast({
        title: `签到前必须填写学号!`,
        icon: 'error',
        iconStyle: 'color: red; size: 60',
      });
    }
  },

  /**
   * 填写学号的绑定事件：
   */
  inputSignSicnuid: function(e) {
    this.setData({
      input_sicnuid: e.detail.detail.value
    });
  },
  /**
   * 检验填写学号的方法：
   */
  validate_sicnuid_input: function(e) {
    if (e.detail.isError) {
      for (let i = 0; i < e.detail.errors.length; i++) {
        wx.lin.showToast({
          title: e.detail.errors[i].message,
          icon: 'error',
          iconStyle: 'color: red; size: 60',
        });
      }
      this.setData({
        input_sicnuid: '',
      });
    }
  },

})