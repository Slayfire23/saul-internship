import axios from "axios";
import React, { useEffect, useState } from "react";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { useLocation, useParams } from "react-router-dom";
import AuthorImage from "../images/author_thumbnail.jpg";
import Skeleton from "../components/UI/Skeleton";
import { enrichWithAuthorData, getAuthorUrl, topSellersUrl } from "../utils/authorUtils";

const loriHartAuthorId = "73855012";

function removeDuplicateItems(items) {
  const seenItems = new Set();

  return items.filter(item => {
    const itemKeys = [
      item.nftId && `nft-${item.nftId}`,
      item.nftImage && `image-${item.nftImage}`,
      item.title && `title-${item.title}`,
    ].filter(Boolean);

    if (itemKeys.some(itemKey => seenItems.has(itemKey))) {
      return false;
    }

    itemKeys.forEach(itemKey => seenItems.add(itemKey));
    return true;
  });
}

const Author = () => {
  const location = useLocation();
  const { id } = useParams();
  const [author, setAuthor] = useState(location.state?.author);
  const [authorItems, setAuthorItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(573);

  useEffect(() => {
    async function getAuthor() {
      const authorId = String(id || location.state?.author?.authorId || "");

      if (!authorId) {
        if (location.state?.author) {
          setAuthor(location.state.author);
        }
        setItemsLoading(false);
        return;
      }

      try {
        setItemsLoading(true);

        const [newItemsResponse, hotCollectionsResponse, exploreResponse, sellersResponse] = await Promise.all([
          axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems"),
          axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections"),
          axios.get("https://us-central1-nft-cloud-functions.cloudfunctions.net/explore"),
          axios.get(topSellersUrl),
        ]);
        const matchingSeller = sellersResponse.data.find(seller => String(seller.authorId) === authorId);
        const marketplaceItems = enrichWithAuthorData([
          ...newItemsResponse.data.map(item => ({ ...item, cardId: `new-${item.id}` })),
          ...hotCollectionsResponse.data.map(item => ({ ...item, cardId: `hot-${item.id}` })),
          ...exploreResponse.data.map(item => ({ ...item, cardId: `explore-${item.id}` })),
        ], sellersResponse.data);

        if (authorId === loriHartAuthorId) {
          const response = await axios.get(getAuthorUrl(authorId));
          const authorData = response.data;
          const authorCollection = authorData.nftCollection || [];
          const authorItems = removeDuplicateItems(authorCollection).map(item => {
            const matchingMarketplaceItem = marketplaceItems.find(marketplaceItem => (
              marketplaceItem.nftId === item.nftId ||
              marketplaceItem.id === item.nftId ||
              marketplaceItem.title === item.title
            ));
            const creatorItem = String(matchingMarketplaceItem?.authorId) === loriHartAuthorId
              ? {}
              : matchingMarketplaceItem;

            return {
              ...item,
              ...creatorItem,
              id: item.nftId || creatorItem?.id || item.id,
              cardId: `author-${item.nftId || item.id}`,
              ownerId: authorData.authorId,
              ownerName: authorData.authorName,
              ownerImage: authorData.authorImage,
            };
          });

          setAuthor(authorData);
          setAuthorItems(authorItems);
          setFollowers(authorData.followers || 573);
          setIsFollowing(false);
          return;
        }

        const authorItems = removeDuplicateItems(
          marketplaceItems.filter(item => String(item.authorId) === authorId)
        );

        setAuthor(matchingSeller || location.state?.author);
        setAuthorItems(authorItems);
        setFollowers(matchingSeller?.followers || 573);
        setIsFollowing(false);
      } catch (error) {
        console.error("Author API error:", error);
      } finally {
        setItemsLoading(false);
      }
    }

    getAuthor();
  }, [id, location.state]);

  const authorName = author?.authorName || (author?.authorId ? `Author #${author.authorId}` : "Monica Lucas");
  const authorImage = author?.authorImage || AuthorImage;
  const authorUsername = author?.tag ? `@${author.tag}` : `@${authorName.toLowerCase().replaceAll(" ", "")}`;
  const bannerImage = authorItems[0]?.nftImage || AuthorBanner;

  function handleFollowClick() {
    setIsFollowing(!isFollowing);
    setFollowers(isFollowing ? followers - 1 : followers + 1);
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          data-bgimage="url(images/author_banner.jpg) top"
          data-aos="fade-down"
          style={{
            background: itemsLoading
              ? "linear-gradient(90deg, #eeeeee 25%, #f7f7f7 50%, #eeeeee 75%)"
              : `url(${bannerImage}) center / cover`,
          }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex" data-aos="fade-up">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      {itemsLoading ? (
                        <Skeleton width="150px" height="150px" borderRadius="50%" />
                      ) : (
                        <img src={authorImage} alt="" />
                      )}

                      {!itemsLoading && <i className="fa fa-check"></i>}
                      <div className="profile_name">
                        {itemsLoading ? (
                          <div>
                            <Skeleton width="180px" height="28px" borderRadius="4px" />
                            <Skeleton width="120px" height="18px" borderRadius="4px" />
                            <Skeleton width="340px" height="18px" borderRadius="4px" />
                          </div>
                        ) : (
                          <h4>
                            {authorName}
                            <span className="profile_username">{authorUsername}</span>
                            <span id="wallet" className="profile_wallet">
                              {author?.address || "UDHUHWudhwd78wdt7edb32uidbwyuidhg7wUHIFUHWewiqdj87dy7"}
                            </span>
                            <button id="btn_copy" title="Copy Text">
                              Copy
                            </button>
                          </h4>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      {itemsLoading ? (
                        <>
                          <Skeleton width="110px" height="20px" borderRadius="4px" />
                          <Skeleton width="100px" height="42px" borderRadius="4px" />
                        </>
                      ) : (
                        <>
                          <div className="profile_follower">{followers} followers</div>
                          <button className="btn-main" onClick={handleFollowClick}>
                            {isFollowing ? "Unfollow" : "Follow"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="de_tab tab_simple" data-aos="fade-up">
                  <AuthorItems author={author} items={authorItems} loading={itemsLoading} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
