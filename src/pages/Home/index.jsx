import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Col, Row, message } from "antd";
import { Card, Button, Image, Modal, InputNumber } from "antd";
import axios from "axios";
import { PlusOutlined, StarOutlined } from "@ant-design/icons";
import "./index.css";

const Home = () => {
    const [listitem, setListitem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cartList, setCart] = useState([]);
    const [list, setList] = useState([]);
    // 路由
    const navigate = useNavigate();
    // 获取菜单列表
    const fetchData = async () => {
        try {
            const { data } = await axios.get('/api/dish');
            setList(data.data.records);
            message.success('获取成功！！！')
        } catch (error) {
            message.error('获取失败！！！')
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    // 获取路由id
    const [params] = useSearchParams();
    const id = params.get('id');

    // 读取本地缓存并初始化购物车数据
    useEffect(() => {
        const storedCartList = JSON.parse(window.localStorage.getItem(`cartList${id}`)) || [];
        setCart(storedCartList);
    }, [id]);

    useEffect(() => {

        // 使用 setTimeout 延迟设置默认值
        setTimeout(() => {
            setCart((prevCartList) => {
                if (listitem) {
                    const existingItemIndex = prevCartList.findIndex(
                        (item) => item.id === listitem.id
                    );

                    if (existingItemIndex !== -1) {
                        // 商品已存在，更新数量
                        const updatedCart = [...prevCartList];
                        updatedCart[existingItemIndex].num = 1;
                        return updatedCart;
                    } else {
                        // 商品不存在，添加新商品
                        return [
                            ...prevCartList,
                            {
                                ...listitem,
                                num: 1,
                            },
                        ];
                    }
                }

                return prevCartList;
            });
        }, 0);
    }, [listitem]);

    const showModal = (item) => {
        setIsModalOpen(true);
        setListitem(item);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        window.localStorage.setItem(`cartList${id}`, JSON.stringify(cartList));
        navigate(`/?id=${id}`)
        // window.location.reload();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onChange = (value) => {
        setCart((prevCartList) => {
            const existingItemIndex = prevCartList.findIndex(
                (item) => item.id === listitem.id
            );

            if (existingItemIndex !== -1) {
                // 商品已存在，更新数量
                const updatedCart = [...prevCartList];
                updatedCart[existingItemIndex].num = value;
                return updatedCart;
            } else {
                // 商品不存在，添加新商品
                return [
                    ...prevCartList,
                    {
                        ...listitem,
                        num: value,
                    },
                ];
            }
        });
    };

    // 点赞
    const addStar = async (itemId) => {
        try {
            const { data } =  await axios.put(`/api/dish/${itemId}`)
            console.log(data.data)
            message.success('点赞成功！！！')
        } catch (error) {
            message.error('点赞失败！！！')
        }
    }
    return (
        <>
            <div className="Home">
                {list.length > 0 ? ( // 判断 list 是否为空
                    <Row>
                        {list.map((item, index) => (
                            <Col
                                className="col"
                                xs={12}
                                sm={8}
                                md={6}
                                lg={6}
                                xl={4}
                                key={index}
                            >
                                <Card
                                    className="card"
                                    title={item.name}
                                    style={{ width: "100%",minWidth: '10rem',maxWidth:'20rem' }}
                                >
                                    <Image
                                        className="img"
                                        fallback="https://img.katr.tk/2023/12/87b101050aad565ae64c2d0cd83ca6da.png"
                                        src={`/img/${item.image}`}
                                        style={{ objectFit: "cover"}}
                                    />
                                    <span className="card-price">￥{item.price}</span><br />
                                    <span>00</span><Button onClick={() => addStar(item.id)} icon={<StarOutlined />}></Button>
                                    <Button
                                        onClick={() => showModal(item)}
                                        className="add-btn"
                                        type="primary"
                                        shape="circle"
                                        icon={<PlusOutlined />}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <p>暂无菜单数据。</p>
                )}
            </div>
            <Modal
                className="modal"
                title={listitem ? listitem.title : ""}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                cancelText={"取消"}
                okText={"加入购物车"}
            >
                {listitem && (
                    <>
                        <Image className="modal-img" width={"50%"} fallback="https://img.katr.tk/2023/12/87b101050aad565ae64c2d0cd83ca6da.png" src={`/img/${listitem.image}`} />
                        <div className="modal-msg">
                            <div className="card-price">价格：￥{listitem.price}</div>
                            <div>
                                数量：
                                <InputNumber
                                    size="large"
                                    min={1}
                                    max={10}
                                    defaultValue={1}
                                    onChange={onChange}
                                />
                            </div>
                            <p>{listitem.des}</p>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};

export default Home;
