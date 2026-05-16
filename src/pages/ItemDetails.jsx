import axios from "axios";
import React, { useEffect, useState } from "react";
import EthImage from "../images/ethereum.svg";
import { Link, useLocation, useParams } from "react-router-dom";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";
import { enrichWithAuthorData, getAuthorUrl, getItemDetailsUrl, topSellersUrl } from "../utils/authorUtils";

function normalizeItemDetails(details) {
  return {
    ...details,
    authorId: details.creatorId,
    authorName: details.creatorName,
    authorImage: details.creatorImage,
    code: details.tag,
  };
}

const ItemDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const selectedItem = location.state?.collection || location.state?.item;
  const [item, setItem] = useState(selectedItem);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function getOwner() {
      try {
        const response = await axios.get(getAuthorUrl(73855012));
        setOwner(response.data);
      } catch (error) {
        console.error("Owner API error:", error);
      }
    }

    getOwner();
  }, []);

  useEffect(() => {
    async function getItemDetails() {
      let currentItem = selectedItem;
      let nftId = selectedItem?.nftId;

      if (selectedItem) {
        setItem(selectedItem);
      }

      if (!nftId && !id) {
        return;
      }

      try {
        if (!nftId) {
          const [newItemsResponse, hotCollectionsResponse, exploreResponse, sellersResponse] = await Promise.all([
            axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems"),
            axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections"),
            axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/explore"),
            axios.get(topSellersUrl),
          ]);

          const allItems = enrichWithAuthorData([
            ...newItemsResponse.data,
            ...hotCollectionsResponse.data,
            ...exploreResponse.data,
          ], sellersResponse.data);
          const matchedItem = allItems.find(item => String(item.id) === id || String(item.nftId) === id);

          currentItem = matchedItem;
          nftId = matchedItem?.nftId;
          setItem(matchedItem);
        }

        if (nftId) {
          const detailsResponse = await axios.get(getItemDetailsUrl(nftId));
          const detailsItem = normalizeItemDetails(detailsResponse.data);

          setItem({
            ...currentItem,
            ...detailsItem,
          });
        }
      } catch (error) {
        console.error("Item details API error:", error);
      }
    }

    getItemDetails();
  }, [id, selectedItem]);

  const itemImage = item?.nftImage || nftImage;
  const itemTitle = item?.title || "Rainbow Style #194";
  const itemAuthorImage = item?.authorImage || AuthorImage;
  const itemAuthor = item?.authorName || (item?.authorId ? `Author #${item.authorId}` : "Monica Lucas");
  const itemCode = item?.code || "192";
  const itemPrice = item?.price || "1.85";
  const itemLikes = item?.likes || 74;
  const itemViews = item?.views || 100;
  const itemDescription =
    item?.description ||
    "doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
  const authorPath = item
    ? `/author/${item.authorId || item.id}`
    : "/author";
  const ownerName = item?.ownerName || owner?.authorName || "Lori Hart";
  const ownerImage = item?.ownerImage || owner?.authorImage || AuthorImage;
  const ownerId = item?.ownerId || owner?.authorId;
  const ownerPath = ownerId ? `/author/${ownerId}` : "/author";
  const ownerState = item?.ownerName
    ? {
        authorName: item.ownerName,
        authorImage: item.ownerImage,
        authorId: item.ownerId,
      }
    : owner;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              <div className="col-md-6 text-center" data-aos="fade-up">
                <img
                  src={itemImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt=""
                />
              </div>
              <div className="col-md-6" data-aos="fade-down" data-aos-delay="150">
                <div className="item_info">
                  <h2>{itemTitle}</h2>

                  <div className="item_info_counts">
                    <div className="item_info_views">
                      <i className="fa fa-eye"></i>
                      {itemViews}
                    </div>
                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {itemLikes}
                    </div>
                  </div>
                  <p>{itemDescription}</p>
                  <p>ERC-{itemCode}</p>
                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={ownerPath} state={{ author: ownerState }}>
                            <img className="lazy" src={ownerImage} alt="" />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={ownerPath} state={{ author: ownerState }}>{ownerName}</Link>
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>
                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Creator</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={authorPath} state={{ author: item }}>
                            <img className="lazy" src={itemAuthorImage} alt="" />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={authorPath} state={{ author: item }}>{itemAuthor}</Link>
                        </div>
                      </div>
                    </div>
                    <div className="spacer-40"></div>
                    <h6>Price</h6>
                    <div className="nft-item-price">
                      <img src={EthImage} alt="" />
                      <span>{itemPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
